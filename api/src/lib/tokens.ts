import { createHash, randomBytes, randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { config } from "../config/env.js";

/** Mirrors the shared user profile, plus the workspace this session is scoped to. */
export type AccessClaims = {
  sub: string;
  email: string;
  name: string;
  active: boolean;
  plan: "free" | "pro" | "enterprise";
  role: "developer" | "security" | "marketing" | "compliance";
  riskScore: number;
  workspace: string;
  sid: string;
};

const ISSUER = "deskdesk-api";
const AUDIENCE = "deskdesk-spa";

export function signAccessToken(claims: AccessClaims): string {
  // `sub` is already part of the payload, so the `subject` option must NOT be
  // passed as well — jsonwebtoken rejects the pair outright.
  return jwt.sign(claims, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${config.accessTtlMinutes}m`,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function accessTokenTtlSeconds(): number {
  return config.accessTtlMinutes * 60;
}

export function verifyAccessToken(token: string): AccessClaims | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload === "string" || !payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      active: payload.active !== false,
      plan: (payload.plan as AccessClaims["plan"]) ?? "free",
      role: (payload.role as AccessClaims["role"]) ?? "developer",
      riskScore: typeof payload.riskScore === "number" ? payload.riskScore : 1,
      workspace: String(payload.workspace ?? ""),
      sid: String(payload.sid ?? ""),
    };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newFamilyId(): string {
  return randomUUID();
}
