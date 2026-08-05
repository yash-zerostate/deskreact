import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from "../lib/cookies.js";
import { fakeVerify, hashPassword, verifyPassword } from "../lib/password.js";
import { issueSession, revokeSession, rotateSession } from "../lib/sessions.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User, publicUser } from "../models/User.js";

const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;

/** No strength rules — any password works in this demo. */
const passwordSchema = z.string().min(1, "Enter a password").max(128, "Password is too long");

/**
 * Sign-up collects the whole profile; only email and password are required and
 * every attribute has a dropdown on the frontend, so accounts covering the
 * whole matrix can be created without touching the database.
 */
const registerSchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: passwordSchema,
  workspace: z.string().trim().max(80).optional().default(""),
  active: z.enum(["yes", "no"]).optional().default("yes"),
  plan: z.enum(["free", "pro", "enterprise"]).optional().default("free"),
  role: z
    .enum(["developer", "security", "marketing", "compliance"])
    .optional()
    .default("developer"),
  riskScore: z.coerce
    .number()
    .int("Pick a whole number")
    .min(1, "Risk score starts at 1")
    .max(9, "Risk score stops at 9")
    .optional()
    .default(1),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "rate_limited", message: "Too many attempts. Try again shortly." } },
});

export const authRouter = Router();

authRouter.post("/register", authLimiter, validateBody(registerSchema), async (req, res) => {
  const body = req.body as z.infer<typeof registerSchema>;
  const { email, password, active, plan, role, riskScore } = body;
  // Both optional; fall back to something derived from the email so the UI
  // always has a name to show and a workspace to scope tickets by.
  const name = body.name || email.split("@")[0]!;
  const workspace = body.workspace || `${name}'s workspace`;

  if (await User.exists({ email })) {
    res.status(409).json({
      error: {
        code: "email_taken",
        message: "That email is already registered.",
        fields: { email: "That email is already registered." },
      },
    });
    return;
  }

  const user = await User.create({
    name,
    email,
    workspace,
    plan,
    role,
    riskScore,
    // A profile attribute carried in the token, not a login gate.
    active: active === "yes",
    passwordHash: await hashPassword(password),
    lastLoginAt: new Date(),
  });

  const { refreshToken, ...tokens } = await issueSession(user, {
    userAgent: req.get("user-agent") ?? "",
    ip: req.ip,
  });
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user: publicUser(user), ...tokens });
});

authRouter.post("/login", authLimiter, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    await fakeVerify();
    res
      .status(401)
      .json({ error: { code: "invalid_credentials", message: "Email or password is incorrect." } });
    return;
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    res.status(423).json({
      error: { code: "account_locked", message: "Too many failed attempts. Try again later." },
    });
    return;
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = (user.failedLoginCount ?? 0) + 1;
    user.failedLoginCount = failed;
    if (failed >= MAX_FAILED_LOGINS) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedLoginCount = 0;
    }
    await user.save();
    res
      .status(401)
      .json({ error: { code: "invalid_credentials", message: "Email or password is incorrect." } });
    return;
  }

  user.failedLoginCount = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const { refreshToken, ...tokens } = await issueSession(user, {
    userAgent: req.get("user-agent") ?? "",
    ip: req.ip,
  });
  setRefreshCookie(res, refreshToken);
  res.json({ user: publicUser(user), ...tokens });
});

/**
 * Silent refresh. The SPA calls this with `credentials: "include"` and no body —
 * the httpOnly cookie is the whole credential. A fresh access token comes back
 * in the JSON body, never in a cookie.
 */
authRouter.post("/refresh", authLimiter, async (req, res) => {
  const result = await rotateSession(req.cookies?.[REFRESH_COOKIE], {
    userAgent: req.get("user-agent") ?? "",
    ip: req.ip,
  });

  if (!result.ok) {
    clearRefreshCookie(res);
    res.status(401).json({
      error: {
        code: `refresh_${result.reason}`,
        message: "Your session has ended. Please sign in.",
      },
    });
    return;
  }

  const { refreshToken, ...tokens } = result.tokens;
  setRefreshCookie(res, refreshToken);
  res.json({ user: publicUser(result.user), ...tokens });
});

authRouter.post("/logout", async (req, res) => {
  await revokeSession(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.auth!.sub);
  if (!user) {
    res.status(401).json({ error: { code: "unauthenticated", message: "Sign in to continue." } });
    return;
  }
  res.json({ user: publicUser(user) });
});

/**
 * The profile is editable in full here — including plan and risk score, which a
 * real product would never let a user set on themselves. In this demo it is the
 * fastest way to flip an existing account's attributes and watch targeting
 * change without re-registering.
 */
const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(80),
  active: z.enum(["yes", "no"]),
  plan: z.enum(["free", "pro", "enterprise"]),
  role: z.enum(["developer", "security", "marketing", "compliance"]),
  riskScore: z.coerce.number().int().min(1).max(9),
});

authRouter.patch("/me", requireAuth, validateBody(profileSchema), async (req, res) => {
  const { name, active, plan, role, riskScore } = req.body as z.infer<typeof profileSchema>;
  const user = await User.findByIdAndUpdate(
    req.auth!.sub,
    { $set: { name, plan, role, riskScore, active: active === "yes" } },
    { new: true },
  );
  if (!user) {
    res.status(401).json({ error: { code: "unauthenticated", message: "Sign in to continue." } });
    return;
  }
  res.json({ user: publicUser(user) });
});
