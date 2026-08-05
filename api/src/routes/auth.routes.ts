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

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: passwordSchema,
  workspace: z.string().trim().min(2, "Name your workspace").max(80),
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
  const { name, email, password, workspace } = req.body as z.infer<typeof registerSchema>;

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
    passwordHash: await hashPassword(password),
    // The first person in a workspace runs it.
    role: "admin",
    plan: "starter",
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

const profileSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  timezone: z.string().trim().min(3).max(64),
});

authRouter.patch("/me", requireAuth, validateBody(profileSchema), async (req, res) => {
  const { name, timezone } = req.body as z.infer<typeof profileSchema>;
  const user = await User.findByIdAndUpdate(
    req.auth!.sub,
    { $set: { name, timezone } },
    { new: true },
  );
  if (!user) {
    res.status(401).json({ error: { code: "unauthenticated", message: "Sign in to continue." } });
    return;
  }
  res.json({ user: publicUser(user) });
});
