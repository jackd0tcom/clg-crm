import connectToDB from "./db.js";
import { PracticeArea, Tribunal, Rate, EntryService } from "./model.js";

const db = await connectToDB(
  process.env.DATABASE_URL || "postgresql:///clg-db",
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

const rates = [
  {
    rateTitle: "Secretary",
    rate: 165,
  },
  {
    rateTitle: "Attorney",
    rate: 395,
  },
  {
    rateTitle: "Attorney - Court Time",
    rate: 495,
  },
  {
    rateTitle: "Attorney - Probate",
    rate: 495,
  },
];

const entryServices = [
  {
    serviceTitle: "Prepare",
  },
  {
    serviceTitle: "Call with client",
  },
  {
    serviceTitle: "Call with OC",
  },
  {
    serviceTitle: "Call with Court",
  },
  {
    serviceTitle: "Email with Client",
  },
  {
    serviceTitle: "Email with OC",
  },
  {
    serviceTitle: "Email with Court",
  },
  {
    serviceTitle: "Meet with Client",
  },
  {
    serviceTitle: "Document Review",
  },
  {
    serviceTitle: "File Review",
  },
  {
    serviceTitle: "Drafting",
    isDynamic: true,
  },
  {
    serviceTitle: "Travel",
  },
  {
    serviceTitle: "Court Time",
  },
  {
    serviceTitle: "Filing at proth",
  },
  {
    serviceTitle: "Legal research",
  },
  {
    serviceTitle: "Other",
    isDynamic: true,
  },
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

  // Check if practice areas already exist
  const existingRates = await Rate.count();

  if (existingRates === 0) {
    console.log("📋 Creating rates...");
    await Rate.bulkCreate(rates);
    console.log(`✅ Created ${rates.length} rates`);
  } else {
    console.log(`📋 Rates already exist (${existingRates} found)`);
  }

  const existingServices = await EntryService.count();

  if (existingServices === 0) {
    console.log("📋 Creating entry services...");
    await EntryService.bulkCreate(entryServices);
    console.log(`✅ Created ${entryServices.length} entry services`);
  } else {
    console.log(`📋 Entry services already exist (${existingServices} found)`);
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
