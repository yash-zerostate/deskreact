import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import { validateBody } from "../middleware/validate.js";
import { Lead } from "../models/Lead.js";

/**
 * POST /leads — Preta's "Direct to you" form delivery.
 *
 * Called from the VISITOR'S BROWSER on our own site, so it is public and unsigned: nothing
 * proves a request came from Preta. It is validated and rate-limited like any public form
 * endpoint. CORS (WEB_ORIGIN, plus the X-Preta-Request-Id header) is set in app.ts.
 *
 * The loader posts two shapes, both accepted:
 *  - forms / wizards: element_id, element_type, form_name, domain, pathname, form_data, wizard, timestamp
 *  - modal answers:   request_id, element_id, timestamp, form_data
 */
const leadSchema = z.object({
  element_id: z.string().trim().min(1).max(100),
  element_type: z.string().trim().max(40).optional(),
  form_name: z.string().trim().max(200).optional(),
  domain: z.string().trim().max(255).optional(),
  pathname: z.string().trim().max(2000).optional(),
  // The answers: field label → value. Values are whatever the form collected.
  form_data: z
    .record(z.string().max(200), z.unknown())
    .refine((v) => Object.keys(v).length > 0, "No answers")
    .refine((v) => Object.keys(v).length <= 100, "Too many fields"),
  wizard: z.unknown().optional(),
  request_id: z.string().trim().max(100).optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
});

export const leadsRouter = Router();

// Generous for a real visitor, a wall for a script hammering the endpoint.
leadsRouter.use(
  rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }),
);

leadsRouter.post("/", validateBody(leadSchema), async (req, res) => {
  const body = req.body as z.infer<typeof leadSchema>;
  const requestId = body.request_id || req.get("x-preta-request-id") || undefined;

  try {
    await Lead.create({
      elementId: body.element_id,
      elementType: body.element_type ?? null,
      formName: body.form_name ?? null,
      domain: body.domain ?? null,
      pathname: body.pathname ?? null,
      formData: body.form_data,
      wizard: body.wizard ?? null,
      requestId,
      submittedAt: body.timestamp ? new Date(body.timestamp) : null,
      userAgent: req.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (e) {
    // Same request_id again (a retry): it is already saved, so this is still a success.
    if ((e as { code?: number })?.code !== 11000) throw e;
  }

  res.status(201).json({ ok: true });
});
