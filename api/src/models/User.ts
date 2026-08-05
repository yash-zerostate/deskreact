import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["agent", "supervisor", "admin"] as const;
export const PLANS = ["starter", "team", "business"] as const;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "agent" },
    plan: { type: String, enum: PLANS, default: "starter" },
    workspace: { type: String, required: true, trim: true, maxlength: 80 },
    timezone: { type: String, default: "Asia/Kolkata" },
    lastLoginAt: { type: Date, default: null },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: unknown };

export const User: Model<UserDoc> = model<UserDoc>("User", userSchema);

export function publicUser(user: UserDoc) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    workspace: user.workspace,
    timezone: user.timezone,
  };
}
