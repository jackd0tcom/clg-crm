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
  Tribunal,
  CaseTribunal,
} from "./model.js";

const db = await connectToDB(
  process.env.DATABASE_URL || "postgresql:///clg-db"
);

// Practice areas data
const practiceAreasData = [
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
];

// Tribunals data
const tribunalData = [
  { name: "wayne" },
  { name: "pike" },
  { name: "monroe" },
  { name: "carbon" },
  { name: "luzerne" },
  { name: "lackawanna" },
  { name: "susquehanna" },
];

try {
  console.log("🌱 Starting production seed...");

  // Check if practice areas already exist
  const existingAreas = await PracticeArea.count();

  if (existingAreas === 0) {
    console.log("📋 Creating practice areas...");
    await PracticeArea.bulkCreate(practiceAreasData);
    console.log(`✅ Created ${practiceAreasData.length} practice areas`);
  } else {
    console.log(`📋 Practice areas already exist (${existingAreas} found)`);
  }

  // Check if tribunals already exist
  const existingTribunal = await Tribunal.count();

  if (existingTribunal === 0) {
    console.log("Creating tribunal");
    await Tribunal.bulkCreate(tribunalData);
    console.log("Created tribunal areas succesfully");
  } else {
    console.log(`Tribunals already exist, (${existingTribunal}) found`);
  }

  console.log("✅ Production seed completed successfully!");
} catch (error) {
  console.error("❌ Error during production seed:", error);
  throw error;
} finally {
  await db.close();
}
