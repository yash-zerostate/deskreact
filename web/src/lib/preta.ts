/**
 * The Preta context cookie, written by the SPA on its OWN origin.
 *
 * The API cannot set it: in production the API is on onrender.com while this app is
 * on vercel.app — different registrable domains, so a cookie set by the API would
 * never be visible to the loader running here. The API returns the signed token in
 * its response body instead, and we write it ourselves.
 *
 * That is only possible because this cookie is deliberately readable rather than
 * httpOnly — the loader runs in the browser and has to read it. It is safe because
 * of what it holds: a *signed* token carrying only targeting attributes. Editing it
 * breaks the signature, and it authenticates nothing against our API — the real
 * session stays in localStorage (access token) and an httpOnly cookie (refresh).
 */
const COOKIE = "preta_ctx";
const TTL_SECONDS = 900; // matches the access token, so both refresh together

export function setPretaCookie(token: string | null | undefined): void {
  if (!token) return;
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${token}; Path=/; Max-Age=${TTL_SECONDS}; SameSite=Lax${secure}`;
  } catch {
    // Cookies disabled — Preta simply sees an anonymous visitor.
  }
}

/** Called at logout. Removing the cookie is what removes personalised elements. */
export function clearPretaCookie(): void {
  try {
    document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    /* nothing to clear */
  }
}
