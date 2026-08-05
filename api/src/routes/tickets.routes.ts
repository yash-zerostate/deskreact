import { randomBytes } from "node:crypto";

import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { validateBody } from "../middleware/validate.js";
import { PRIORITIES, STATUSES, Ticket } from "../models/Ticket.js";

const createSchema = z.object({
  subject: z.string().trim().min(4, "Give the ticket a subject").max(140),
  body: z.string().trim().min(10, "Describe the issue").max(4000),
  requesterEmail: z.string().trim().toLowerCase().email("Enter a valid email"),
  priority: z.enum(PRIORITIES).default("normal"),
});

const updateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

const commentSchema = z.object({
  body: z.string().trim().min(1, "Write a reply").max(2000),
});

function reference(): string {
  return `DD-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export const ticketsRouter = Router();

// Every route below needs a valid Bearer token.
ticketsRouter.use(requireAuth);

function serialise(ticket: {
  _id: unknown;
  reference: string;
  subject: string;
  body: string;
  requesterEmail: string;
  status: string;
  priority: string;
  comments: Array<{ authorName: string; body: string; createdAt: Date }>;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(ticket._id),
    reference: ticket.reference,
    subject: ticket.subject,
    body: ticket.body,
    requesterEmail: ticket.requesterEmail,
    status: ticket.status,
    priority: ticket.priority,
    comments: ticket.comments.map((comment) => ({
      authorName: comment.authorName,
      body: comment.body,
      createdAt: comment.createdAt,
    })),
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

ticketsRouter.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  // The workspace filter comes from the verified token, never from the query
  // string — that is what keeps one tenant out of another's tickets.
  const filter: Record<string, unknown> = { workspace: req.auth!.workspace };
  if (status && status !== "all") filter.status = status;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { subject: { $regex: safe, $options: "i" } },
      { reference: { $regex: safe, $options: "i" } },
      { requesterEmail: { $regex: safe, $options: "i" } },
    ];
  }

  const tickets = await Ticket.find(filter).sort({ updatedAt: -1 }).limit(100).lean();

  const counts = await Ticket.aggregate<{ _id: string; count: number }>([
    { $match: { workspace: req.auth!.workspace } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    tickets: tickets.map(serialise),
    counts: Object.fromEntries(counts.map((row) => [row._id, row.count])),
  });
});

ticketsRouter.post("/", validateBody(createSchema), async (req, res) => {
  const input = req.body as z.infer<typeof createSchema>;

  const ticket = await Ticket.create({
    ...input,
    workspace: req.auth!.workspace,
    reference: reference(),
    createdById: req.auth!.sub,
  });

  res.status(201).json({ ticket: serialise(ticket) });
});

ticketsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "invalid_id", "Unknown ticket.");

  const ticket = await Ticket.findOne({ _id: id, workspace: req.auth!.workspace }).lean();
  if (!ticket) throw new HttpError(404, "not_found", "Ticket not found.");

  res.json({ ticket: serialise(ticket) });
});

ticketsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "invalid_id", "Unknown ticket.");

  const update = req.body as z.infer<typeof updateSchema>;
  const patch: Record<string, unknown> = { ...update };
  if (update.status) patch.resolvedAt = update.status === "resolved" ? new Date() : null;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: id, workspace: req.auth!.workspace },
    { $set: patch },
    { new: true },
  );
  if (!ticket) throw new HttpError(404, "not_found", "Ticket not found.");

  res.json({ ticket: serialise(ticket) });
});

ticketsRouter.post("/:id/comments", validateBody(commentSchema), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "invalid_id", "Unknown ticket.");

  const ticket = await Ticket.findOneAndUpdate(
    { _id: id, workspace: req.auth!.workspace },
    {
      $push: {
        comments: {
          authorId: req.auth!.sub,
          authorName: req.auth!.name,
          body: (req.body as z.infer<typeof commentSchema>).body,
          createdAt: new Date(),
        },
      },
    },
    { new: true },
  );
  if (!ticket) throw new HttpError(404, "not_found", "Ticket not found.");

  res.status(201).json({ ticket: serialise(ticket) });
});

/** Deleting is destructive, so it is restricted to workspace admins. */
ticketsRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "invalid_id", "Unknown ticket.");

  const result = await Ticket.deleteOne({ _id: id, workspace: req.auth!.workspace });
  if (result.deletedCount === 0) throw new HttpError(404, "not_found", "Ticket not found.");

  res.json({ ok: true });
});
