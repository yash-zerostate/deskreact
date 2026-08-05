import { Schema, Types, model, type InferSchemaType, type Model } from "mongoose";

/**
 * The SPA keeps its short-lived access token in the browser, so the long-lived
 * credential must be something the browser's JavaScript cannot read at all:
 * an opaque, revocable refresh token in an httpOnly cookie, stored here as a
 * SHA-256 hash.
 */
const refreshTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDoc = InferSchemaType<typeof refreshTokenSchema> & { _id: unknown };

export const RefreshToken: Model<RefreshTokenDoc> = model<RefreshTokenDoc>(
  "RefreshToken",
  refreshTokenSchema,
);
