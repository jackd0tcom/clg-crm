
import connectToDB from "./db.js";
import {
  User,
  Task,
  Case,
  Person,
  Comment,
  ActivityLog,
  Notification,
  CaseAssignees,
  TaskAssignees,
  ActivityReaders,
  PracticeArea,
  CasePracticeAreas,
} from "./model.js";
import bcrypt from "bcryptjs";

const db = await connectToDB(process.env.DATABASE_URL || "postgresql:///clg-db");


console.log("Creating practice areas...");
const practiceAreas = await PracticeArea.bulkCreate([
  { name: "divorce" },
  { name: "custody" },
  { name: "child support" },
  { name: "child custody" },
  { name: "spousal support" },
  { name: "real estate - buyer" },
  { name: "real estate - seller" },
  { name: "real estate - litigation" },
  { name: "personal injury - MVA" },
  { name: "personal injury - premise" },
  { name: "negligent security" },
  { name: "dog bite" },
  { name: "products liability" },
  { name: "estate planning" },
  { name: "probate" },
  { name: "trust" },
  { name: "business formation" },
  { name: "community association" },
  { name: "property damage" },
  { name: "PFA" },
  { name: "general civil litigation" },
  { name: "employment law" },
  { name: "foreign judgments" },
]);

// Sync database and seed data
await db.sync({ force: true }).then(async () => {

  console.log("Creating practice areas...");

  await PracticeArea.bulkCreate(practiceAreas);

  console.log("Database reset and seeded successfully!");
});

await db.close();
