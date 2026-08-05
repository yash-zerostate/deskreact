import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken, type AccessClaims } from "../lib/tokens.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessClaims;
    }
  }
}

/**
 * Bearer only. There is deliberately no cookie fallback for the access token:
 * because this API never authenticates a state-changing request from a cookie,
 * it is not reachable by CSRF at all — a cross-site form cannot add an
 * Authorization header.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { code: "missing_token", message: "Sign in to continue." },
    });
    return;
  }

  const claims = verifyAccessToken(header.slice(7));
  if (!claims) {
    // A distinct code so the SPA knows to try a silent refresh instead of
    // bouncing the user straight to the login screen.
    res.status(401).json({
      error: { code: "token_expired", message: "Session expired." },
    });
    return;
  }

  req.auth = claims;
  next();
}

export function requireRole(...roles: Array<AccessClaims["role"]>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: { code: "forbidden", message: "Not allowed." } });
      return;
    }
    next();
  };
}
