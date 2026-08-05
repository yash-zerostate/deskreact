import { Schema, Types, model, type InferSchemaType, type Model } from "mongoose";

export const STATUSES = ["open", "pending", "resolved"] as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const commentSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ticketSchema = new Schema(
  {
    // Every query is scoped by workspace — this is the tenant boundary, and it
    // is enforced in the query itself rather than checked afterwards.
    workspace: { type: String, required: true, index: true },
    reference: { type: String, required: true, unique: true },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, required: true, maxlength: 4000 },
    requesterEmail: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: STATUSES, default: "open", index: true },
    priority: { type: String, enum: PRIORITIES, default: "normal" },
    assigneeId: { type: Types.ObjectId, ref: "User", default: null },
    createdById: { type: Types.ObjectId, ref: "User", required: true },
    comments: { type: [commentSchema], default: [] },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ workspace: 1, status: 1, updatedAt: -1 });

export type TicketDoc = InferSchemaType<typeof ticketSchema> & { _id: unknown };

export const Ticket: Model<TicketDoc> = model<TicketDoc>("Ticket", ticketSchema);
