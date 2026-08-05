/** Idempotent seed for the DeskDesk API. Run with `npm run seed`. */
import mongoose from "mongoose";

import { config } from "../src/config/env.js";
import { hashPassword } from "../src/lib/password.js";
import { Ticket } from "../src/models/Ticket.js";
import { PLANS, ROLES, User } from "../src/models/User.js";

/**
 * Accounts registered before the profile schema changed are missing the new
 * fields, or carry a role from the old set (agent/supervisor/admin). Reading
 * them still works, but any save would fail validation — so bring every
 * straggler onto the current shape.
 */
async function normaliseLegacyUsers(): Promise<void> {
  const users = User.collection;

  const filled = await users.updateMany(
    { $or: [{ active: { $exists: false } }, { riskScore: { $exists: false } }] },
    { $set: { active: true, riskScore: 1 } },
  );
  const roles = await users.updateMany(
    { role: { $nin: ROLES as unknown as string[] } },
    { $set: { role: "developer" } },
  );
  const plans = await users.updateMany(
    { plan: { $nin: PLANS as unknown as string[] } },
    { $set: { plan: "free" } },
  );
  const cleaned = await users.updateMany({}, { $unset: { timezone: "" } });

  const touched = filled.modifiedCount + roles.modifiedCount + plans.modifiedCount;
  if (touched > 0 || cleaned.modifiedCount > 0) {
    console.log(
      `  migrated ${touched} legacy user document(s), cleared stale fields on ${cleaned.modifiedCount}`,
    );
  }
}

const PASSWORD = "Password123!";
const WORKSPACE = "Acme Support";

/**
 * The same accounts exist in all three demo apps, chosen to cover the whole
 * attribute matrix — every plan, every role, both active states and a spread of
 * risk scores. They all share one workspace so they see the same tickets.
 */
const ACCOUNTS = [
  { email: "admin@example.com", name: "Aditi Rao", active: true, plan: "enterprise", role: "compliance", riskScore: 2 },
  { email: "pro@example.com", name: "Rohan Mehta", active: true, plan: "pro", role: "developer", riskScore: 5 },
  { email: "free@example.com", name: "Sara Iyer", active: true, plan: "free", role: "marketing", riskScore: 7 },
  { email: "security@example.com", name: "Imran Qureshi", active: true, plan: "pro", role: "security", riskScore: 9 },
  { email: "inactive@example.com", name: "Neha Kapoor", active: false, plan: "pro", role: "developer", riskScore: 4 },
  { email: "dev-free@example.com", name: "Kabir Shah", active: true, plan: "free", role: "developer", riskScore: 1 },
  { email: "yash@gmail.com", name: "yash", active: true, plan: "enterprise", role: "marketing", riskScore: 8 },
] as const;

const TICKETS = [
  {
    reference: "DD-1001",
    subject: "Invoice shows the wrong GST number",
    body: "Our October invoice has the old GST number. Can you reissue it with the updated one on file?",
    requesterEmail: "finance@northwind.io",
    status: "open",
    priority: "high",
  },
  {
    reference: "DD-1002",
    subject: "SSO login loops back to the sign-in page",
    body: "Three users on Okta get bounced back to sign-in after authenticating. Chrome and Edge both.",
    requesterEmail: "it@northwind.io",
    status: "pending",
    priority: "urgent",
  },
  {
    reference: "DD-1003",
    subject: "Export finishes but the CSV is empty",
    body: "The 90-day export downloads a 0 KB file. The 30-day one works.",
    requesterEmail: "ops@bluebird.co",
    status: "open",
    priority: "normal",
  },
  {
    reference: "DD-1004",
    subject: "Request: weekly digest on Mondays",
    body: "Could the digest arrive Monday 9am IST instead of Sunday night?",
    requesterEmail: "hello@bluebird.co",
    status: "resolved",
    priority: "low",
  },
];

async function main() {
  await mongoose.connect(config.mongoUri, { dbName: config.mongoDb });
  console.log(`Connected to ${config.mongoDb}`);

  const passwordHash = await hashPassword(PASSWORD);
  let firstUserId: unknown = null;

  for (const account of ACCOUNTS) {
    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          active: account.active,
          plan: account.plan,
          role: account.role,
          riskScore: account.riskScore,
          workspace: WORKSPACE,
        },
        $setOnInsert: { passwordHash },
        // Attribute from the previous schema, cleared so old documents do not
        // keep stale fields around.
        $unset: { timezone: "" },
      },
      { upsert: true, new: true },
    );
    firstUserId ??= user!._id;
    console.log(
      `  user  ${account.email.padEnd(22)} ${account.plan.padEnd(10)} ${account.role.padEnd(10)} risk ${account.riskScore} ${account.active ? "" : "(inactive)"}`,
    );
  }

  for (const ticket of TICKETS) {
    await Ticket.findOneAndUpdate(
      { reference: ticket.reference },
      {
        $set: { ...ticket, workspace: WORKSPACE },
        $setOnInsert: { createdById: firstUserId, comments: [] },
      },
      { upsert: true },
    );
    console.log(`  tkt   ${ticket.reference}`);
  }

  await normaliseLegacyUsers();

  console.log(`\nDone. All seeded accounts use the password: ${PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
