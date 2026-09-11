import { config } from "../config/env.js";
import { createPretaContextToken } from "./preta-token.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User, type UserDoc } from "../models/User.js";
import {
  accessTokenTtlSeconds,
  generateRefreshToken,
  hashRefreshToken,
  newFamilyId,
  signAccessToken,
  type AccessClaims,
} from "./tokens.js";

export type IssuedTokens = {
  accessToken: string;
  /** Seconds until the access token expires — the SPA schedules its refresh off this. */
  expiresIn: number;
  refreshToken: string;
  /**
   * Signed Preta context JWT. Travels in the response body, not a cookie: the SPA
   * lives on a different registrable domain, so it writes the cookie on its own
   * origin where the loader can actually read it.
   */
  pretaToken: string | null;
};

/** The attributes Preta targets on, taken straight off the user row. */
function pretaAttributes(user: UserDoc) {
  return {
    plan: String(user.plan),
    role: String(user.role),
    active: user.active !== false,
    risk_score: user.riskScore,
  };
}

export type RequestContext = { userAgent?: string; ip?: string };

function refreshExpiry(): Date {
  return new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
}

function claimsFor(user: UserDoc, familyId: string): AccessClaims {
  return {
    sub: String(user._id),
    email: user.email,
    name: user.name,
    active: user.active !== false,
    plan: user.plan as AccessClaims["plan"],
    role: user.role as AccessClaims["role"],
    riskScore: user.riskScore,
    workspace: user.workspace,
    sid: familyId,
  };
}

export async function issueSession(user: UserDoc, ctx: RequestContext = {}): Promise<IssuedTokens> {
  const familyId = newFamilyId();
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    familyId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: refreshExpiry(),
    userAgent: ctx.userAgent ?? "",
    ip: ctx.ip ?? "",
  });

  return {
    accessToken: signAccessToken(claimsFor(user, familyId)),
    expiresIn: accessTokenTtlSeconds(),
    refreshToken,
    pretaToken: createPretaContextToken(pretaAttributes(user)),
  };
}

export type RotateResult =
  | { ok: true; tokens: IssuedTokens; user: UserDoc }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "reused" | "revoked" };

export async function rotateSession(
  presentedToken: string | undefined,
  ctx: RequestContext = {},
): Promise<RotateResult> {
  if (!presentedToken) return { ok: false, reason: "missing" };

  const record = await RefreshToken.findOne({ tokenHash: hashRefreshToken(presentedToken) });
  if (!record) return { ok: false, reason: "invalid" };

  if (record.revokedAt) {
    // A token rotated moments ago is almost always the browser, not a thief: the
    // refresh reached us and rotated, but the page reloaded before the response —
    // and its Set-Cookie — arrived, so the old cookie is still all it has.
    const rotatedJustNow =
      Boolean(record.replacedByHash) &&
      Date.now() - record.revokedAt.getTime() <= config.refreshReuseGraceSeconds * 1000;

    if (!rotatedJustNow) {
      // The token was already rotated away, so a copy is in circulation. Kill the
      // whole family rather than trusting whoever presented it.
      await RefreshToken.updateMany(
        { familyId: record.familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      return { ok: false, reason: "reused" };
    }

    // Logout and reuse detection revoke tokens WITHOUT a successor. If the family
    // has one of those, the session was ended on purpose — the grace window must
    // not bring it back.
    const ended = await RefreshToken.exists({
      familyId: record.familyId,
      revokedAt: { $ne: null },
      replacedByHash: null,
    });
    if (ended) return { ok: false, reason: "revoked" };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await RefreshToken.updateOne({ _id: record._id }, { $set: { revokedAt: new Date() } });
    return { ok: false, reason: "expired" };
  }

  const user = await User.findById(record.userId);
  if (!user) {
    await RefreshToken.updateMany({ familyId: record.familyId }, { $set: { revokedAt: new Date() } });
    return { ok: false, reason: "revoked" };
  }

  const nextToken = generateRefreshToken();
  const nextHash = hashRefreshToken(nextToken);

  await RefreshToken.create({
    userId: user._id,
    familyId: record.familyId,
    tokenHash: nextHash,
    expiresAt: refreshExpiry(),
    userAgent: ctx.userAgent ?? record.userAgent,
    ip: ctx.ip ?? record.ip,
  });

  // `revokedAt: null` makes this a no-op on a grace-window replay, so replaying the
  // old cookie cannot keep pushing its revocation time forward.
  await RefreshToken.updateOne(
    { _id: record._id, revokedAt: null },
    { $set: { revokedAt: new Date(), replacedByHash: nextHash } },
  );

  return {
    ok: true,
    user,
    tokens: {
      accessToken: signAccessToken(claimsFor(user, record.familyId)),
      expiresIn: accessTokenTtlSeconds(),
      refreshToken: nextToken,
      // Re-signed from the LIVE user row, so an attribute changed since login is
      // picked up on the next refresh rather than waiting for a re-login.
      pretaToken: createPretaContextToken(pretaAttributes(user)),
    },
  };
}

export async function revokeSession(presentedToken: string | undefined): Promise<void> {
  if (!presentedToken) return;
  const record = await RefreshToken.findOne({ tokenHash: hashRefreshToken(presentedToken) });
  if (!record) return;
  await RefreshToken.updateMany(
    { familyId: record.familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}
