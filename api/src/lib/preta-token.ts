// Signs the Preta context JWT (RS256). Preta verifies it with the matching PUBLIC
// key registered for the SPA's domain — deskdesk-public.pem.
//
// Unlike a full-stack app, this token is returned in the RESPONSE BODY rather than
// set as a cookie. The API and the SPA are on different registrable domains in
// production (onrender.com vs vercel.app), so a cookie set here would never be
// visible to the loader running on the SPA's page. The SPA writes it as a cookie
// on its own origin instead — which it can, because this cookie is deliberately
// readable rather than httpOnly.
import jwt from "jsonwebtoken";

/** Attributes Preta targets on. No email, no raw database id. */
export type PretaAttributes = {
  plan: string;
  role: string;
  active: boolean;
  risk_score: number;
};

/** Seconds the token stays valid — matched to the access token so both refresh together. */
export const PRETA_TOKEN_TTL_SECONDS = 900;

/**
 * Returns null instead of throwing when the key is missing or malformed: a broken
 * Preta config must never break signing in.
 */
export function createPretaContextToken(attributes: PretaAttributes): string | null {
  const raw = process.env.PRETA_PRIVATE_KEY;
  if (!raw) return null;

  // The PEM may carry real newlines or \n escapes depending on how the host stores it.
  const pem = raw.includes("BEGIN") ? raw.replace(/\\n/g, "\n") : Buffer.from(raw, "base64").toString("utf8");

  try {
    return jwt.sign({ "preta:user": attributes }, pem, {
      algorithm: "RS256",
      expiresIn: PRETA_TOKEN_TTL_SECONDS,
    });
  } catch (e) {
    console.error("[Preta] context sign failed:", (e as Error)?.message);
    return null;
  }
}
