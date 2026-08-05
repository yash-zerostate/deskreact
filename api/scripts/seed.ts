/** Idempotent seed for the DeskDesk API. Run with `npm run seed`. */
import mongoose from "mongoose";

import { config } from "../src/config/env.js";
import { hashPassword } from "../src/lib/password.js";
import { Ticket } from "../src/models/Ticket.js";
import { User } from "../src/models/User.js";

const PASSWORD = "Password123!";
const WORKSPACE = "Acme Support";

const ACCOUNTS = [
  { name: "Aditi Rao", email: "admin@example.com", role: "admin", plan: "business" },
  { name: "Rohan Mehta", email: "pro@example.com", role: "supervisor", plan: "team" },
  { name: "Sara Iyer", email: "free@example.com", role: "agent", plan: "starter" },
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
          role: account.role,
          plan: account.plan,
          workspace: WORKSPACE,
        },
        $setOnInsert: { passwordHash, timezone: "Asia/Kolkata" },
      },
      { upsert: true, new: true },
    );
    firstUserId ??= user!._id;
    console.log(`  user  ${account.email} (${account.role})`);
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

  console.log(`\nDone. All seeded accounts use the password: ${PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
