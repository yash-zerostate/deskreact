import type { CookieOptions, Response } from "express";

import { config } from "../config/env.js";

/**
 * Only ONE cookie exists in this app: the refresh token.
 *
 * The access token is returned in the JSON body and held by the SPA, because a
 * static SPA on a CDN has no server of its own to read a cookie for it. The
 * long-lived credential still never touches JavaScript — it is httpOnly, so an
 * XSS can at worst use the current access token until it expires, not mint new
 * ones forever.
 */
export const REFRESH_COOKIE = "deskdesk_refresh";

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure,
    domain: config.cookie.domain,
    // Scoped to the only routes that ever need it.
    path: "/auth",
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions(),
    maxAge: config.refreshTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, baseOptions());
}
