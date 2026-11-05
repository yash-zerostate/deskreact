import { Schema, model, type InferSchemaType, type Model } from "mongoose";

/**
 * A form submission delivered straight from the visitor's browser by Preta's loader
 * ("Direct to you" in Preta's Form delivery step). Preta never sees `formData`; it only
 * records whether this endpoint answered.
 */
const leadSchema = new Schema(
  {
    // The Preta element (form, wizard, modal…) that produced it. Stable across renames.
    elementId: { type: String, required: true, index: true },
    elementType: { type: String, default: null },
    formName: { type: String, default: null },
    domain: { type: String, default: null },
    pathname: { type: String, default: null },
    // The answers exactly as the visitor gave them: { "Name": "…", "Email": "…" }.
    formData: { type: Schema.Types.Mixed, required: true },
    // A wizard's whole journey (path, run_id…), when the form is a wizard.
    wizard: { type: Schema.Types.Mixed, default: null },
    // Sent by modal answers (X-Preta-Request-Id). Unique, so a retried request is saved once.
    requestId: { type: String, default: undefined },
    // When the visitor submitted (the loader's clock), and when we received it.
    submittedAt: { type: Date, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: "receivedAt", updatedAt: false } },
);

leadSchema.index({ requestId: 1 }, { unique: true, sparse: true });
leadSchema.index({ elementId: 1, receivedAt: -1 });

export type LeadDoc = InferSchemaType<typeof leadSchema> & { _id: unknown };

export const Lead: Model<LeadDoc> = model<LeadDoc>("Lead", leadSchema);
