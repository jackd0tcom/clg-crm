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
} from "./model.js";
import bcrypt from "bcryptjs";

const db = await connectToDB(
  process.env.DATABASE_URL || "postgresql:///clg-db",
);

const users = [
  {
    username: "meg_attorney",
    firstName: "Meg",
    lastName: "Williams",
    role: "user",
    isAllowed: true,
  },
  {
    username: "jenn_paralegal",
    firstName: "Jenn",
    lastName: "Davis",
    role: "user",
    isAllowed: true,
  },
  {
    username: "mike_partner",
    firstName: "Mike",
    lastName: "Thompson",
    role: "admin",
    isAllowed: true,
  },
  {
    username: "lisa_associate",
    firstName: "Lisa",
    lastName: "Rodriguez",
    role: "user",
    isAllowed: true,
  },
  {
    username: "hannah_associate",
    firstName: "Hannah",
    lastName: "Ball",
    role: "user",
    isAllowed: true,
  },
];

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

// Tribunal
const tribunal = await Tribunal.bulkCreate([
  { name: "wayne" },
  { name: "pike" },
  { name: "monroe" },
  { name: "carbon" },
  { name: "luzerne" },
  { name: "lackawanna" },
  { name: "susquehanna" },
]);

// Helper function to create dates
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// Create cases - 30 cases covering all phases, dates, and scenarios
const cases = [
  // INTAKE phase cases
  {
    ownerId: 1,
    title: "Smith Divorce Settlement",
    notes: "High-conflict divorce case, assets include family business and real estate holdings",
    phase: "intake",
    sol: daysFromNow(730), // 2 years from now
    createdAt: daysAgo(5),
  },
  {
    ownerId: 2,
    title: "New Client Consultation - Estate Planning",
    notes: "Initial consultation for comprehensive estate planning needs",
    phase: "intake",
    sol: null,
    createdAt: daysAgo(2),
  },
  {
    ownerId: 3,
    title: "Employment Discrimination Claim",
    notes: "Client alleges wrongful termination based on age discrimination",
    phase: "intake",
    sol: daysFromNow(180),
    createdAt: daysAgo(1),
  },
  {
    ownerId: 4,
    title: "Dog Bite Injury Case",
    notes: "Neighbor's dog attacked client's child, seeking damages",
    phase: "intake",
    sol: daysFromNow(365),
    createdAt: daysAgo(7),
  },
  
  // INVESTIGATION phase cases
  {
    ownerId: 1,
    title: "Custody Battle - Johnson Family",
    notes: "Custody dispute involving relocation and school district changes",
    phase: "investigation",
    sol: null,
    createdAt: daysAgo(30),
  },
  {
    ownerId: 2,
    title: "Premises Liability - Slip and Fall",
    notes: "Client injured at grocery store, investigating negligence claims",
    phase: "investigation",
    sol: daysFromNow(545),
    createdAt: daysAgo(45),
  },
  {
    ownerId: 3,
    title: "Child Support Modification",
    notes: "Requesting modification based on changed financial circumstances",
    phase: "investigation",
    sol: null,
    createdAt: daysAgo(20),
  },
  {
    ownerId: 4,
    title: "Business Contract Dispute",
    notes: "Breach of contract claim between two local businesses",
    phase: "investigation",
    sol: daysFromNow(90),
    createdAt: daysAgo(60),
  },
  {
    ownerId: 5,
    title: "PFA Order - Domestic Violence",
    notes: "Seeking protection from abuse order against former partner",
    phase: "investigation",
    sol: null,
    createdAt: daysAgo(3),
  },
  
  // NEGOTIATION phase cases
  {
    ownerId: 1,
    title: "Spousal Support Negotiation",
    notes: "Negotiating alimony payments post-divorce settlement",
    phase: "negotiation",
    sol: null,
    createdAt: daysAgo(90),
  },
  {
    ownerId: 2,
    title: "Real Estate Purchase Dispute",
    notes: "Buyer seeking return of earnest money after seller breach",
    phase: "negotiation",
    sol: daysFromNow(60),
    createdAt: daysAgo(120),
  },
  {
    ownerId: 3,
    title: "Personal Injury - MVA Settlement",
    notes: "Negotiating settlement for rear-end collision injuries",
    phase: "negotiation",
    sol: daysFromNow(300),
    createdAt: daysAgo(180),
  },
  {
    ownerId: 4,
    title: "Probate Estate Administration",
    notes: "Handling estate administration and beneficiary disputes",
    phase: "negotiation",
    sol: null,
    createdAt: daysAgo(150),
  },
  
  // LITIGATION phase cases
  {
    ownerId: 1,
    title: "Downtown Real Estate Development",
    notes: "Zoning issues for mixed-use development project",
    phase: "litigation",
    sol: null,
    createdAt: daysAgo(200),
  },
  {
    ownerId: 2,
    title: "Products Liability - Defective Product",
    notes: "Suing manufacturer for injuries caused by defective product",
    phase: "litigation",
    sol: daysFromNow(400),
    createdAt: daysAgo(250),
  },
  {
    ownerId: 3,
    title: "Complex Divorce - High Net Worth",
    notes: "Contentious divorce with significant assets and business interests",
    phase: "litigation",
    sol: null,
    createdAt: daysAgo(300),
  },
  {
    ownerId: 4,
    title: "Employment Law - Wage Dispute",
    notes: "Class action lawsuit for unpaid overtime and wage violations",
    phase: "litigation",
    sol: daysFromNow(180),
    createdAt: daysAgo(220),
  },
  {
    ownerId: 5,
    title: "Community Association Litigation",
    notes: "HOA dispute over property rights and assessment fees",
    phase: "litigation",
    sol: null,
    createdAt: daysAgo(100),
  },
  
  // SETTLEMENT phase cases
  {
    ownerId: 1,
    title: "Personal Injury - Car Accident",
    notes: "Multi-vehicle accident with severe injuries, insurance company dispute",
    phase: "settlement",
    sol: daysFromNow(200),
    createdAt: daysAgo(400),
  },
  {
    ownerId: 2,
    title: "Negligent Security Claim",
    notes: "Settlement negotiations for assault in parking garage",
    phase: "settlement",
    sol: daysFromNow(500),
    createdAt: daysAgo(350),
  },
  {
    ownerId: 3,
    title: "Property Damage - Insurance Claim",
    notes: "Settling property damage claim from storm damage",
    phase: "settlement",
    sol: null,
    createdAt: daysAgo(280),
  },
  {
    ownerId: 4,
    title: "Trust Dispute Resolution",
    notes: "Mediating trust beneficiary disputes and distributions",
    phase: "settlement",
    sol: null,
    createdAt: daysAgo(320),
  },
  
  // CLOSED cases
  {
    ownerId: 1,
    title: "Estate Planning - Completed",
    notes: "Successfully completed comprehensive estate plan",
    phase: "closed",
    sol: null,
    createdAt: daysAgo(500),
  },
  {
    ownerId: 2,
    title: "Business Formation - LLC Setup",
    notes: "Completed LLC formation and operating agreement",
    phase: "closed",
    sol: null,
    createdAt: daysAgo(600),
  },
  {
    ownerId: 3,
    title: "Simple Divorce - Uncontested",
    notes: "Uncontested divorce finalized, all assets divided",
    phase: "closed",
    sol: null,
    createdAt: daysAgo(450),
  },
  {
    ownerId: 4,
    title: "Real Estate Closing - Residential",
    notes: "Successfully closed residential property purchase",
    phase: "closed",
    sol: null,
    createdAt: daysAgo(380),
  },
  
  // ARCHIVED cases
  {
    ownerId: 1,
    title: "Old Case - Archived",
    notes: "Case from previous year, archived for record keeping",
    phase: "closed",
    sol: null,
    isArchived: true,
    createdAt: daysAgo(800),
  },
  {
    ownerId: 2,
    title: "Completed Probate - Archived",
    notes: "Probate case completed and archived",
    phase: "closed",
    sol: null,
    isArchived: true,
    createdAt: daysAgo(700),
  },
  
  // Additional cases for variety
  {
    ownerId: 3,
    title: "Foreign Judgment Enforcement",
    notes: "Enforcing out-of-state judgment in local jurisdiction",
    phase: "litigation",
    sol: daysFromNow(120),
    createdAt: daysAgo(75),
  },
  {
    ownerId: 4,
    title: "General Civil Litigation - Contract",
    notes: "Breach of commercial lease agreement",
    phase: "investigation",
    sol: daysFromNow(240),
    createdAt: daysAgo(40),
  },
  {
    ownerId: 5,
    title: "Child Custody Modification",
    notes: "Seeking modification of existing custody arrangement",
    phase: "negotiation",
    sol: null,
    createdAt: daysAgo(25),
  },
];

// Create people involved in cases - expanded with clients, adverse, and opposing parties
const people = [
  // Case 1 - Smith Divorce
  { caseId: 1, firstName: "John", lastName: "Smith", address: "123 Oak Street", city: "Springfield", state: "PA", zip: "18401", phoneNumber: "5705550101", dob: "1980-03-15", county: "Wayne", SSN: 123456, type: "client" },
  { caseId: 1, firstName: "Mary", lastName: "Smith", address: "456 Maple Avenue", city: "Springfield", state: "PA", zip: "18402", phoneNumber: "5705550102", dob: "1982-07-22", county: "Wayne", SSN: 123457, type: "adverse" },
  
  // Case 2 - Estate Planning
  { caseId: 2, firstName: "Robert", lastName: "Chen", address: "789 Business Blvd", city: "Scranton", state: "PA", zip: "18501", phoneNumber: "5705550201", dob: "1975-11-08", county: "Lackawanna", SSN: 123458, type: "client" },
  
  // Case 3 - Employment Discrimination
  { caseId: 3, firstName: "Amanda", lastName: "Johnson", address: "321 Family Circle", city: "Stroudsburg", state: "PA", zip: "18360", phoneNumber: "5705550301", dob: "1988-05-14", county: "Monroe", SSN: 123459, type: "client" },
  { caseId: 3, firstName: "TechCorp", lastName: "Inc", address: "100 Corporate Drive", city: "Allentown", state: "PA", zip: "18101", phoneNumber: "6105550302", dob: null, county: "Lehigh", SSN: null, type: "adverse" },
  
  // Case 4 - Dog Bite
  { caseId: 4, firstName: "Emily", lastName: "Martinez", address: "555 Park Avenue", city: "Wilkes-Barre", state: "PA", zip: "18701", phoneNumber: "5705550401", dob: "2015-08-20", county: "Luzerne", SSN: 123460, type: "client" },
  { caseId: 4, firstName: "James", lastName: "Wilson", address: "789 Dogwood Lane", city: "Wilkes-Barre", state: "PA", zip: "18702", phoneNumber: "5705550402", dob: "1985-02-10", county: "Luzerne", SSN: 123461, type: "adverse" },
  
  // Case 5 - Custody Battle
  { caseId: 5, firstName: "Michael", lastName: "Johnson", address: "654 Parent Lane", city: "Scranton", state: "PA", zip: "18502", phoneNumber: "5705550501", dob: "1986-09-30", county: "Lackawanna", SSN: 123462, type: "client" },
  { caseId: 5, firstName: "Sarah", lastName: "Johnson", address: "321 Family Circle", city: "Scranton", state: "PA", zip: "18503", phoneNumber: "5705550502", dob: "1988-05-14", county: "Lackawanna", SSN: 123463, type: "opposing" },
  
  // Case 6 - Premises Liability
  { caseId: 6, firstName: "David", lastName: "Brown", address: "987 Hospital Drive", city: "Honesdale", state: "PA", zip: "18431", phoneNumber: "5705550601", dob: "1990-12-03", county: "Wayne", SSN: 123464, type: "client" },
  { caseId: 6, firstName: "MegaMart", lastName: "Stores", address: "200 Commerce Blvd", city: "Honesdale", state: "PA", zip: "18432", phoneNumber: "5705550602", dob: null, county: "Wayne", SSN: null, type: "adverse" },
  
  // Case 7 - Child Support
  { caseId: 7, firstName: "Jennifer", lastName: "Davis", address: "111 Main Street", city: "Stroudsburg", state: "PA", zip: "18361", phoneNumber: "5705550701", dob: "1992-04-18", county: "Monroe", SSN: 123465, type: "client" },
  { caseId: 7, firstName: "Thomas", lastName: "Davis", address: "222 Second Street", city: "Stroudsburg", state: "PA", zip: "18362", phoneNumber: "5705550702", dob: "1990-08-25", county: "Monroe", SSN: 123466, type: "opposing" },
  
  // Case 8 - Business Contract
  { caseId: 8, firstName: "ABC", lastName: "Construction", address: "333 Builder Way", city: "Scranton", state: "PA", zip: "18504", phoneNumber: "5705550801", dob: null, county: "Lackawanna", SSN: null, type: "client" },
  { caseId: 8, firstName: "XYZ", lastName: "Suppliers", address: "444 Supply Road", city: "Wilkes-Barre", state: "PA", zip: "18703", phoneNumber: "5705550802", dob: null, county: "Luzerne", SSN: null, type: "adverse" },
  
  // Case 9 - PFA
  { caseId: 9, firstName: "Lisa", lastName: "Anderson", address: "555 Safe Haven", city: "Honesdale", state: "PA", zip: "18433", phoneNumber: "5705550901", dob: "1995-06-15", county: "Wayne", SSN: 123467, type: "client" },
  { caseId: 9, firstName: "Mark", lastName: "Anderson", address: "666 Danger Street", city: "Honesdale", state: "PA", zip: "18434", phoneNumber: "5705550902", dob: "1993-03-20", county: "Wayne", SSN: 123468, type: "adverse" },
  
  // Case 10 - Spousal Support
  { caseId: 10, firstName: "Patricia", lastName: "White", address: "777 Divorce Lane", city: "Scranton", state: "PA", zip: "18505", phoneNumber: "5705551001", dob: "1985-11-12", county: "Lackawanna", SSN: 123469, type: "client" },
  { caseId: 10, firstName: "Richard", lastName: "White", address: "888 Alimony Ave", city: "Scranton", state: "PA", zip: "18506", phoneNumber: "5705551002", dob: "1983-09-05", county: "Lackawanna", SSN: 123470, type: "opposing" },
  
  // Case 11 - Real Estate Purchase
  { caseId: 11, firstName: "Nancy", lastName: "Garcia", address: "999 Buyer Blvd", city: "Stroudsburg", state: "PA", zip: "18363", phoneNumber: "5705551101", dob: "1978-01-30", county: "Monroe", SSN: 123471, type: "client" },
  { caseId: 11, firstName: "Seller", lastName: "Properties LLC", address: "1000 Seller Street", city: "Stroudsburg", state: "PA", zip: "18364", phoneNumber: "5705551102", dob: null, county: "Monroe", SSN: null, type: "adverse" },
  
  // Case 12 - Personal Injury MVA
  { caseId: 12, firstName: "Christopher", lastName: "Lee", address: "1111 Accident Way", city: "Wilkes-Barre", state: "PA", zip: "18704", phoneNumber: "5705551201", dob: "1987-07-22", county: "Luzerne", SSN: 123472, type: "client" },
  { caseId: 12, firstName: "Insurance", lastName: "Company", address: "2222 Insurance Plaza", city: "Philadelphia", state: "PA", zip: "19101", phoneNumber: "2155551202", dob: null, county: "Philadelphia", SSN: null, type: "adverse" },
  
  // Case 13 - Probate
  { caseId: 13, firstName: "Estate of", lastName: "Williams", address: "3333 Estate Drive", city: "Honesdale", state: "PA", zip: "18435", phoneNumber: "5705551301", dob: null, county: "Wayne", SSN: null, type: "client" },
  { caseId: 13, firstName: "Robert", lastName: "Williams Jr", address: "4444 Heir Avenue", city: "Honesdale", state: "PA", zip: "18436", phoneNumber: "5705551302", dob: "1960-05-10", county: "Wayne", SSN: 123473, type: "client" },
  
  // Case 14 - Real Estate Development
  { caseId: 14, firstName: "Development", lastName: "Partners", address: "5555 Build Street", city: "Scranton", state: "PA", zip: "18507", phoneNumber: "5705551401", dob: null, county: "Lackawanna", SSN: null, type: "client" },
  { caseId: 14, firstName: "City", lastName: "Planning Dept", address: "6666 City Hall", city: "Scranton", state: "PA", zip: "18508", phoneNumber: "5705551402", dob: null, county: "Lackawanna", SSN: null, type: "opposing" },
  
  // Case 15 - Products Liability
  { caseId: 15, firstName: "Karen", lastName: "Taylor", address: "7777 Injury Lane", city: "Stroudsburg", state: "PA", zip: "18365", phoneNumber: "5705551501", dob: "1991-12-08", county: "Monroe", SSN: 123474, type: "client" },
  { caseId: 15, firstName: "Manufacturing", lastName: "Corp", address: "8888 Factory Road", city: "Pittsburgh", state: "PA", zip: "15201", phoneNumber: "4125551502", dob: null, county: "Allegheny", SSN: null, type: "adverse" },
  
  // Case 16 - Complex Divorce
  { caseId: 16, firstName: "William", lastName: "Moore", address: "9999 Wealthy Way", city: "Wilkes-Barre", state: "PA", zip: "18705", phoneNumber: "5705551601", dob: "1975-04-15", county: "Luzerne", SSN: 123475, type: "client" },
  { caseId: 16, firstName: "Elizabeth", lastName: "Moore", address: "10000 Rich Street", city: "Wilkes-Barre", state: "PA", zip: "18706", phoneNumber: "5705551602", dob: "1977-10-20", county: "Luzerne", SSN: 123476, type: "adverse" },
  
  // Case 17 - Employment Law
  { caseId: 17, firstName: "Daniel", lastName: "Jackson", address: "11111 Worker Blvd", city: "Honesdale", state: "PA", zip: "18437", phoneNumber: "5705551701", dob: "1989-02-14", county: "Wayne", SSN: 123477, type: "client" },
  { caseId: 17, firstName: "Big", lastName: "Employer Inc", address: "22222 Corporate Center", city: "Scranton", state: "PA", zip: "18509", phoneNumber: "5705551702", dob: null, county: "Lackawanna", SSN: null, type: "adverse" },
  
  // Case 18 - HOA Dispute
  { caseId: 18, firstName: "Homeowner", lastName: "Association", address: "33333 HOA Drive", city: "Stroudsburg", state: "PA", zip: "18366", phoneNumber: "5705551801", dob: null, county: "Monroe", SSN: null, type: "client" },
  { caseId: 18, firstName: "John", lastName: "Resident", address: "44444 Home Street", city: "Stroudsburg", state: "PA", zip: "18367", phoneNumber: "5705551802", dob: "1982-08-30", county: "Monroe", SSN: 123478, type: "adverse" },
  
  // Case 19 - Personal Injury Settlement
  { caseId: 19, firstName: "Maria", lastName: "Rodriguez", address: "55555 Crash Avenue", city: "Wilkes-Barre", state: "PA", zip: "18707", phoneNumber: "5705551901", dob: "1993-11-25", county: "Luzerne", SSN: 123479, type: "client" },
  
  // Case 20 - Negligent Security
  { caseId: 20, firstName: "Steven", lastName: "Harris", address: "66666 Security Way", city: "Honesdale", state: "PA", zip: "18438", phoneNumber: "5705552001", dob: "1988-06-18", county: "Wayne", SSN: 123480, type: "client" },
  { caseId: 20, firstName: "Parking", lastName: "Garage LLC", address: "77777 Garage Road", city: "Honesdale", state: "PA", zip: "18439", phoneNumber: "5705552002", dob: null, county: "Wayne", SSN: null, type: "adverse" },
  
  // Case 21 - Property Damage
  { caseId: 21, firstName: "Paul", lastName: "Clark", address: "88888 Storm Street", city: "Scranton", state: "PA", zip: "18510", phoneNumber: "5705552101", dob: "1979-03-12", county: "Lackawanna", SSN: 123481, type: "client" },
  { caseId: 21, firstName: "Property", lastName: "Insurance Co", address: "99999 Insurance Blvd", city: "Philadelphia", state: "PA", zip: "19102", phoneNumber: "2155552102", dob: null, county: "Philadelphia", SSN: null, type: "adverse" },
  
  // Case 22 - Trust Dispute
  { caseId: 22, firstName: "Trust", lastName: "Beneficiary", address: "100000 Trust Lane", city: "Stroudsburg", state: "PA", zip: "18368", phoneNumber: "5705552201", dob: "1965-09-05", county: "Monroe", SSN: 123482, type: "client" },
  { caseId: 22, firstName: "Trust", lastName: "Administrator", address: "111111 Admin Way", city: "Stroudsburg", state: "PA", zip: "18369", phoneNumber: "5705552202", dob: "1963-12-20", county: "Monroe", SSN: 123483, type: "opposing" },
  
  // Case 23 - Estate Planning (Closed)
  { caseId: 23, firstName: "Margaret", lastName: "Lewis", address: "222222 Estate Ave", city: "Wilkes-Barre", state: "PA", zip: "18708", phoneNumber: "5705552301", dob: "1945-07-15", county: "Luzerne", SSN: 123484, type: "client" },
  
  // Case 24 - Business Formation (Closed)
  { caseId: 24, firstName: "New", lastName: "Business LLC", address: "333333 Startup Street", city: "Honesdale", state: "PA", zip: "18440", phoneNumber: "5705552401", dob: null, county: "Wayne", SSN: null, type: "client" },
  
  // Case 25 - Simple Divorce (Closed)
  { caseId: 25, firstName: "Robert", lastName: "Young", address: "444444 Simple Way", city: "Scranton", state: "PA", zip: "18511", phoneNumber: "5705552501", dob: "1984-01-25", county: "Lackawanna", SSN: 123485, type: "client" },
  { caseId: 25, firstName: "Susan", lastName: "Young", address: "555555 Simple Lane", city: "Scranton", state: "PA", zip: "18512", phoneNumber: "5705552502", dob: "1986-05-10", county: "Lackawanna", SSN: 123486, type: "adverse" },
  
  // Case 26 - Real Estate Closing (Closed)
  { caseId: 26, firstName: "Thomas", lastName: "Walker", address: "666666 Home Street", city: "Stroudsburg", state: "PA", zip: "18370", phoneNumber: "5705552601", dob: "1990-08-12", county: "Monroe", SSN: 123487, type: "client" },
  
  // Case 27 - Foreign Judgment
  { caseId: 27, firstName: "Out of State", lastName: "Creditor", address: "777777 Foreign Blvd", city: "New York", state: "NY", zip: "10001", phoneNumber: "2125552701", dob: null, county: "New York", SSN: null, type: "client" },
  { caseId: 27, firstName: "Local", lastName: "Debtor", address: "888888 Local Street", city: "Wilkes-Barre", state: "PA", zip: "18709", phoneNumber: "5705552702", dob: "1981-11-30", county: "Luzerne", SSN: 123488, type: "adverse" },
  
  // Case 28 - General Civil Litigation
  { caseId: 28, firstName: "Commercial", lastName: "Tenant LLC", address: "999999 Lease Way", city: "Honesdale", state: "PA", zip: "18441", phoneNumber: "5705552801", dob: null, county: "Wayne", SSN: null, type: "client" },
  { caseId: 28, firstName: "Commercial", lastName: "Landlord", address: "1000000 Landlord Ave", city: "Honesdale", state: "PA", zip: "18442", phoneNumber: "5705552802", dob: null, county: "Wayne", SSN: null, type: "adverse" },
  
  // Case 29 - Child Custody Modification
  { caseId: 29, firstName: "Jessica", lastName: "Martinez", address: "1111111 Custody Lane", city: "Scranton", state: "PA", zip: "18513", phoneNumber: "5705552901", dob: "1994-04-22", county: "Lackawanna", SSN: 123489, type: "client" },
  { caseId: 29, firstName: "Ryan", lastName: "Martinez", address: "2222222 Parent Road", city: "Scranton", state: "PA", zip: "18514", phoneNumber: "5705552902", dob: "1992-10-15", county: "Lackawanna", SSN: 123490, type: "opposing" },
];

// Create tasks - 50+ tasks with all statuses, priorities, and date ranges
const tasks = [
  // URGENT priority tasks
  { ownerId: 1, title: "File emergency motion", notes: "Urgent motion needed for tomorrow's hearing", caseId: 1, dueDate: daysFromNow(1), priority: "urgent", status: "not started", createdAt: daysAgo(1) },
  { ownerId: 2, title: "Respond to discovery deadline", notes: "Discovery responses due tomorrow", caseId: 14, dueDate: daysFromNow(1), priority: "urgent", status: "in progress", createdAt: daysAgo(2) },
  { ownerId: 3, title: "Court filing deadline", notes: "Motion must be filed by end of day", caseId: 15, dueDate: daysFromNow(0), priority: "urgent", status: "not started", createdAt: daysAgo(1) },
  { ownerId: 4, title: "Settlement conference prep", notes: "Prepare for settlement conference tomorrow", caseId: 19, dueDate: daysFromNow(1), priority: "urgent", status: "in progress", createdAt: daysAgo(1) },
  { ownerId: 5, title: "Emergency client meeting", notes: "Client emergency - need to meet today", caseId: 9, dueDate: daysFromNow(0), priority: "urgent", status: "not started", createdAt: daysAgo(0) },
  
  // HIGH priority tasks
  { ownerId: 1, title: "Review financial disclosure documents", notes: "Need to analyze Smith family business financials for equitable distribution", caseId: 1, dueDate: daysFromNow(3), priority: "high", status: "in progress", createdAt: daysAgo(5) },
  { ownerId: 2, title: "Deposition preparation", notes: "Prepare client for upcoming deposition", caseId: 14, dueDate: daysFromNow(5), priority: "high", status: "not started", createdAt: daysAgo(3) },
  { ownerId: 3, title: "Mediation brief", notes: "Prepare mediation brief for next week", caseId: 16, dueDate: daysFromNow(7), priority: "high", status: "in progress", createdAt: daysAgo(4) },
  { ownerId: 4, title: "Negotiate with insurance adjuster", notes: "Discuss settlement offer and medical expenses coverage", caseId: 19, dueDate: daysFromNow(2), priority: "high", status: "in progress", createdAt: daysAgo(10) },
  { ownerId: 5, title: "Expert witness report review", notes: "Review and analyze expert witness report", caseId: 15, dueDate: daysFromNow(4), priority: "high", status: "not started", createdAt: daysAgo(2) },
  { ownerId: 1, title: "Client consultation prep", notes: "Prepare materials for important client consultation", caseId: 3, dueDate: daysFromNow(6), priority: "high", status: "in progress", createdAt: daysAgo(1) },
  { ownerId: 2, title: "Contract review and revisions", notes: "Review and revise business contract", caseId: 8, dueDate: daysFromNow(8), priority: "high", status: "not started", createdAt: daysAgo(5) },
  { ownerId: 3, title: "Motion to compel", notes: "Draft motion to compel discovery responses", caseId: 14, dueDate: daysFromNow(10), priority: "high", status: "in progress", createdAt: daysAgo(7) },
  
  // NORMAL priority tasks
  { ownerId: 1, title: "Interview child's teacher and counselor", notes: "Gather information about child's academic and emotional well-being", caseId: 5, dueDate: daysFromNow(5), priority: "normal", status: "not started", createdAt: daysAgo(15) },
  { ownerId: 2, title: "Research recent zoning precedents", notes: "Find similar cases that support our development proposal", caseId: 14, dueDate: daysFromNow(4), priority: "normal", status: "in progress", createdAt: daysAgo(20) },
  { ownerId: 3, title: "Draft estate planning documents", notes: "Prepare will and trust documents", caseId: 2, dueDate: daysFromNow(14), priority: "normal", status: "not started", createdAt: daysAgo(2) },
  { ownerId: 4, title: "Client follow-up call", notes: "Follow up on client questions from last meeting", caseId: 12, dueDate: daysFromNow(7), priority: "normal", status: "not started", createdAt: daysAgo(3) },
  { ownerId: 5, title: "File routine court documents", notes: "File standard court documents", caseId: 7, dueDate: daysFromNow(12), priority: "normal", status: "in progress", createdAt: daysAgo(8) },
  { ownerId: 1, title: "Update case file", notes: "Update case file with recent developments", caseId: 10, dueDate: daysFromNow(9), priority: "normal", status: "not started", createdAt: daysAgo(5) },
  { ownerId: 2, title: "Research case law", notes: "Research relevant case law for motion", caseId: 18, dueDate: daysFromNow(15), priority: "normal", status: "in progress", createdAt: daysAgo(12) },
  { ownerId: 3, title: "Prepare client letter", notes: "Draft letter updating client on case status", caseId: 11, dueDate: daysFromNow(6), priority: "normal", status: "not started", createdAt: daysAgo(4) },
  { ownerId: 4, title: "Schedule expert witness", notes: "Coordinate scheduling with expert witness", caseId: 6, dueDate: daysFromNow(11), priority: "normal", status: "not started", createdAt: daysAgo(6) },
  { ownerId: 5, title: "Review medical records", notes: "Review and organize medical records", caseId: 12, dueDate: daysFromNow(13), priority: "normal", status: "in progress", createdAt: daysAgo(9) },
  { ownerId: 1, title: "Prepare settlement proposal", notes: "Draft settlement proposal for opposing counsel", caseId: 20, dueDate: daysFromNow(8), priority: "normal", status: "not started", createdAt: daysAgo(7) },
  { ownerId: 2, title: "Organize case documents", notes: "Organize and index case documents", caseId: 13, dueDate: daysFromNow(16), priority: "normal", status: "in progress", createdAt: daysAgo(10) },
  
  // LOW priority tasks
  { ownerId: 1, title: "Archive old case files", notes: "Archive files from closed cases", caseId: null, dueDate: daysFromNow(30), priority: "low", status: "not started", createdAt: daysAgo(20) },
  { ownerId: 2, title: "Update firm website", notes: "Update practice area descriptions", caseId: null, dueDate: daysFromNow(45), priority: "low", status: "not started", createdAt: daysAgo(15) },
  { ownerId: 3, title: "Continuing education registration", notes: "Register for upcoming CLE course", caseId: null, dueDate: daysFromNow(60), priority: "low", status: "not started", createdAt: daysAgo(25) },
  { ownerId: 4, title: "Review office procedures", notes: "Review and update office procedures manual", caseId: null, dueDate: daysFromNow(90), priority: "low", status: "not started", createdAt: daysAgo(30) },
  
  // BLOCKED tasks
  { ownerId: 1, title: "Awaiting client response", notes: "Waiting for client to provide necessary documents", caseId: 4, dueDate: daysFromNow(20), priority: "normal", status: "blocked", createdAt: daysAgo(10) },
  { ownerId: 2, title: "Pending court order", notes: "Waiting for court to issue order before proceeding", caseId: 14, dueDate: daysFromNow(25), priority: "high", status: "blocked", createdAt: daysAgo(8) },
  { ownerId: 3, title: "Expert witness unavailable", notes: "Expert witness unavailable until next month", caseId: 6, dueDate: daysFromNow(35), priority: "normal", status: "blocked", createdAt: daysAgo(12) },
  { ownerId: 4, title: "Opposing counsel delay", notes: "Opposing counsel has delayed response", caseId: 8, dueDate: daysFromNow(18), priority: "normal", status: "blocked", createdAt: daysAgo(6) },
  
  // COMPLETED tasks (past due dates)
  { ownerId: 1, title: "Initial client consultation", notes: "Completed initial consultation with client", caseId: 1, dueDate: daysAgo(10), priority: "normal", status: "completed", createdAt: daysAgo(15) },
  { ownerId: 2, title: "File initial pleadings", notes: "Filed initial pleadings with court", caseId: 14, dueDate: daysAgo(5), priority: "high", status: "completed", createdAt: daysAgo(20) },
  { ownerId: 3, title: "Serve discovery requests", notes: "Served discovery requests on opposing party", caseId: 15, dueDate: daysAgo(8), priority: "normal", status: "completed", createdAt: daysAgo(25) },
  { ownerId: 4, title: "Client intake forms", notes: "Completed all client intake forms", caseId: 3, dueDate: daysAgo(3), priority: "normal", status: "completed", createdAt: daysAgo(5) },
  { ownerId: 5, title: "Research statute of limitations", notes: "Researched and confirmed SOL dates", caseId: 12, dueDate: daysAgo(7), priority: "high", status: "completed", createdAt: daysAgo(12) },
  { ownerId: 1, title: "Draft retainer agreement", notes: "Drafted and sent retainer agreement", caseId: 2, dueDate: daysAgo(2), priority: "normal", status: "completed", createdAt: daysAgo(4) },
  { ownerId: 2, title: "File motion to dismiss", notes: "Filed motion to dismiss complaint", caseId: 18, dueDate: daysAgo(12), priority: "high", status: "completed", createdAt: daysAgo(30) },
  { ownerId: 3, title: "Prepare witness list", notes: "Prepared and filed witness list", caseId: 16, dueDate: daysAgo(15), priority: "normal", status: "completed", createdAt: daysAgo(40) },
  { ownerId: 4, title: "Settlement conference", notes: "Attended settlement conference", caseId: 19, dueDate: daysAgo(20), priority: "high", status: "completed", createdAt: daysAgo(50) },
  { ownerId: 5, title: "Client meeting", notes: "Met with client to discuss case strategy", caseId: 5, dueDate: daysAgo(6), priority: "normal", status: "completed", createdAt: daysAgo(10) },
  
  // Tasks with no due date
  { ownerId: 1, title: "Ongoing case monitoring", notes: "Monitor case developments", caseId: 1, dueDate: null, priority: "low", status: "in progress", createdAt: daysAgo(100) },
  { ownerId: 2, title: "Long-term case strategy", notes: "Develop long-term case strategy", caseId: 14, dueDate: null, priority: "normal", status: "not started", createdAt: daysAgo(50) },
  { ownerId: 3, title: "Client relationship building", notes: "Maintain ongoing client relationship", caseId: 23, dueDate: null, priority: "low", status: "in progress", createdAt: daysAgo(200) },
  
  // Tasks with past due dates (overdue)
  { ownerId: 1, title: "Overdue - Follow up with client", notes: "Need to follow up with client on outstanding issues", caseId: 4, dueDate: daysAgo(5), priority: "high", status: "not started", createdAt: daysAgo(20) },
  { ownerId: 2, title: "Overdue - File response", notes: "Response to motion is overdue", caseId: 15, dueDate: daysAgo(3), priority: "urgent", status: "not started", createdAt: daysAgo(10) },
  { ownerId: 3, title: "Overdue - Review documents", notes: "Documents need review - past deadline", caseId: 8, dueDate: daysAgo(7), priority: "normal", status: "in progress", createdAt: daysAgo(15) },
  
  // Tasks with far future due dates
  { ownerId: 1, title: "Trial preparation", notes: "Begin trial preparation", caseId: 14, dueDate: daysFromNow(90), priority: "normal", status: "not started", createdAt: daysAgo(5) },
  { ownerId: 2, title: "Annual case review", notes: "Annual review of all active cases", caseId: null, dueDate: daysFromNow(180), priority: "low", status: "not started", createdAt: daysAgo(10) },
  { ownerId: 3, title: "Appeal deadline", notes: "File notice of appeal if needed", caseId: 16, dueDate: daysFromNow(120), priority: "normal", status: "not started", createdAt: daysAgo(8) },
];

// Create comments - expanded comments for various cases and tasks
const comments = [
  // Case comments
  { authorId: 1, objectType: "case", objectId: 1, content: "Initial consultation completed. Client provided all necessary documents." },
  { authorId: 2, objectType: "case", objectId: 1, content: "Reviewed financial disclosure. Need to schedule follow-up meeting." },
  { authorId: 3, objectType: "case", objectId: 5, content: "Client mentioned concerns about child's relationship with father. Need to document this for custody evaluation." },
  { authorId: 4, objectType: "case", objectId: 14, content: "Zoning board meeting scheduled for next Thursday. Need to prepare presentation materials." },
  { authorId: 5, objectType: "case", objectId: 19, content: "Settlement negotiations progressing well. Expecting response from opposing counsel." },
  { authorId: 1, objectType: "case", objectId: 3, content: "Employment discrimination claim has merit. Proceeding with investigation." },
  { authorId: 2, objectType: "case", objectId: 8, content: "Contract dispute requires detailed review of all correspondence." },
  { authorId: 3, objectType: "case", objectId: 12, content: "Client's medical records received. Reviewing for settlement negotiations." },
  { authorId: 4, objectType: "case", objectId: 16, content: "High net worth divorce requires careful asset valuation." },
  { authorId: 5, objectType: "case", objectId: 20, content: "Negligent security claim - gathering evidence from parking garage." },
  
  // Task comments
  { authorId: 1, objectType: "task", objectId: 1, content: "Financial documents received from client. Need to verify authenticity of business valuations." },
  { authorId: 2, objectType: "task", objectId: 1, content: "I'll review the business valuation reports tomorrow. Sarah, can you forward the tax returns?" },
  { authorId: 4, objectType: "task", objectId: 4, content: "Insurance company offered $50K settlement. Client wants to counter with $150K based on medical bills and lost wages." },
  { authorId: 3, objectType: "task", objectId: 6, content: "Deposition prep materials ready. Client review scheduled for Friday." },
  { authorId: 5, objectType: "task", objectId: 8, content: "Expert witness report received. Reviewing for case strategy." },
  { authorId: 1, objectType: "task", objectId: 11, content: "Client consultation materials prepared. Ready for meeting." },
  { authorId: 2, objectType: "task", objectId: 15, content: "Contract revisions completed. Sending to client for review." },
  { authorId: 3, objectType: "task", objectId: 18, content: "Motion to compel drafted. Filing tomorrow morning." },
  { authorId: 4, objectType: "task", objectId: 25, content: "Case file updated with all recent developments." },
  { authorId: 5, objectType: "task", objectId: 30, content: "Medical records organized and indexed. Ready for review." },
  { authorId: 1, objectType: "task", objectId: 35, content: "Settlement proposal sent to opposing counsel. Awaiting response." },
  { authorId: 2, objectType: "task", objectId: 41, content: "Client provided additional documents. Reviewing now." },
  { authorId: 3, objectType: "task", objectId: 42, content: "Court order received. Proceeding with next steps." },
];

// Create activity logs - expanded activity logs for various cases and tasks
const activityLogs = [
  // Case activities
  { authorId: 1, objectType: "case", objectId: 1, action: "case_created", details: "Case opened: Smith Divorce Settlement" },
  { authorId: 1, objectType: "case", objectId: 1, action: "phase_updated", details: "Changed case phase to intake" },
  { authorId: 2, objectType: "case", objectId: 2, action: "case_created", details: "Case opened: New Client Consultation - Estate Planning" },
  { authorId: 3, objectType: "case", objectId: 3, action: "case_created", details: "Case opened: Employment Discrimination Claim" },
  { authorId: 3, objectType: "case", objectId: 3, action: "case_assigned", details: "Assigned case to Jenn Davis" },
  { authorId: 4, objectType: "case", objectId: 4, action: "case_created", details: "Case opened: Dog Bite Injury Case" },
  { authorId: 1, objectType: "case", objectId: 5, action: "case_created", details: "Case opened: Custody Battle - Johnson Family" },
  { authorId: 1, objectType: "case", objectId: 5, action: "phase_updated", details: "Changed case phase to investigation" },
  { authorId: 2, objectType: "case", objectId: 14, action: "case_created", details: "Case opened: Downtown Real Estate Development" },
  { authorId: 2, objectType: "case", objectId: 14, action: "phase_updated", details: "Changed case phase to litigation" },
  { authorId: 3, objectType: "case", objectId: 19, action: "phase_updated", details: "Changed case phase to settlement" },
  { authorId: 4, objectType: "case", objectId: 23, action: "phase_updated", details: "Changed case phase to closed" },
  { authorId: 5, objectType: "case", objectId: 25, action: "phase_updated", details: "Changed case phase to closed" },
  { authorId: 1, objectType: "case", objectId: 26, action: "case_archived", details: "Case archived: Real Estate Closing - Residential" },
  { authorId: 2, objectType: "case", objectId: 2, action: "comment_added", details: "Added comment about estate planning needs" },
  { authorId: 3, objectType: "case", objectId: 5, action: "comment_added", details: "Added comment about custody evaluation" },
  
  // Task activities
  { authorId: 1, objectType: "task", objectId: 1, action: "task_created", details: "Created task: Review financial disclosure documents" },
  { authorId: 2, objectType: "task", objectId: 1, action: "status_updated", details: "Updated task status to 'in progress'" },
  { authorId: 1, objectType: "task", objectId: 2, action: "task_created", details: "Created task: Deposition preparation" },
  { authorId: 3, objectType: "task", objectId: 3, action: "task_created", details: "Created task: Mediation brief" },
  { authorId: 3, objectType: "task", objectId: 3, action: "status_updated", details: "Updated task status to 'in progress'" },
  { authorId: 4, objectType: "task", objectId: 4, action: "task_created", details: "Created task: Negotiate with insurance adjuster" },
  { authorId: 4, objectType: "task", objectId: 4, action: "priority_changed", details: "Changed task priority from 'normal' to 'high'" },
  { authorId: 5, objectType: "task", objectId: 5, action: "task_created", details: "Created task: Expert witness report review" },
  { authorId: 1, objectType: "task", objectId: 6, action: "task_created", details: "Created task: Client consultation prep" },
  { authorId: 1, objectType: "task", objectId: 6, action: "status_updated", details: "Updated task status to 'in progress'" },
  { authorId: 2, objectType: "task", objectId: 7, action: "task_created", details: "Created task: Contract review and revisions" },
  { authorId: 3, objectType: "task", objectId: 8, action: "task_created", details: "Created task: Motion to compel" },
  { authorId: 3, objectType: "task", objectId: 8, action: "status_updated", details: "Updated task status to 'in progress'" },
  { authorId: 4, objectType: "task", objectId: 41, action: "task_created", details: "Created task: Awaiting client response" },
  { authorId: 4, objectType: "task", objectId: 41, action: "status_updated", details: "Updated task status to 'blocked'" },
  { authorId: 5, objectType: "task", objectId: 42, action: "task_created", details: "Created task: Pending court order" },
  { authorId: 5, objectType: "task", objectId: 42, action: "status_updated", details: "Updated task status to 'blocked'" },
  { authorId: 1, objectType: "task", objectId: 36, action: "task_created", details: "Created task: Initial client consultation" },
  { authorId: 1, objectType: "task", objectId: 36, action: "status_updated", details: "Updated task status to 'completed'" },
  { authorId: 2, objectType: "task", objectId: 37, action: "task_created", details: "Created task: File initial pleadings" },
  { authorId: 2, objectType: "task", objectId: 37, action: "status_updated", details: "Updated task status to 'completed'" },
  { authorId: 3, objectType: "task", objectId: 38, action: "task_created", details: "Created task: Serve discovery requests" },
  { authorId: 3, objectType: "task", objectId: 38, action: "status_updated", details: "Updated task status to 'completed'" },
  { authorId: 4, objectType: "task", objectId: 39, action: "task_created", details: "Created task: Client intake forms" },
  { authorId: 4, objectType: "task", objectId: 39, action: "status_updated", details: "Updated task status to 'completed'" },
  { authorId: 5, objectType: "task", objectId: 40, action: "task_created", details: "Created task: Research statute of limitations" },
  { authorId: 5, objectType: "task", objectId: 40, action: "status_updated", details: "Updated task status to 'completed'" },
  { authorId: 1, objectType: "task", objectId: 46, action: "task_created", details: "Created task: Overdue - Follow up with client" },
  { authorId: 2, objectType: "task", objectId: 47, action: "task_created", details: "Created task: Overdue - File response" },
  { authorId: 2, objectType: "task", objectId: 47, action: "priority_changed", details: "Changed task priority to 'urgent'" },
];

// Create notifications - expanded notifications for various scenarios
const notifications = [
  // Task assignment notifications
  { userId: 2, type: "task_assigned", objectType: "task", objectId: 2, message: "You have been assigned to: Deposition preparation", isRead: false },
  { userId: 3, type: "task_assigned", objectType: "task", objectId: 3, message: "You have been assigned to: Mediation brief", isRead: false },
  { userId: 4, type: "task_assigned", objectType: "task", objectId: 4, message: "You have been assigned to: Negotiate with insurance adjuster", isRead: false },
  { userId: 5, type: "task_assigned", objectType: "task", objectId: 5, message: "You have been assigned to: Expert witness report review", isRead: false },
  { userId: 1, type: "task_assigned", objectType: "task", objectId: 6, message: "You have been assigned to: Client consultation prep", isRead: false },
  
  // Due date notifications
  { userId: 1, type: "task_due_date_changed", objectType: "task", objectId: 1, message: "Task 'Review financial disclosure documents' is due in 3 days", isRead: false },
  { userId: 2, type: "task_due_date_changed", objectType: "task", objectId: 2, message: "Task 'Deposition preparation' is due in 5 days", isRead: false },
  { userId: 3, type: "task_due_date_changed", objectType: "task", objectId: 19, message: "Task 'Interview child's teacher and counselor' is due in 5 days", isRead: false },
  { userId: 4, type: "task_due_date_changed", objectType: "task", objectId: 4, message: "Task 'Negotiate with insurance adjuster' is due in 2 days", isRead: false },
  { userId: 5, type: "task_due_date_changed", objectType: "task", objectId: 1, message: "Task 'File emergency motion' is due tomorrow", isRead: true },
  
  // Status change notifications
  { userId: 1, type: "task_status_changed", objectType: "task", objectId: 1, message: "Task 'Review financial disclosure documents' status changed to 'in progress'", isRead: false },
  { userId: 2, type: "task_status_changed", objectType: "task", objectId: 3, message: "Task 'Mediation brief' status changed to 'in progress'", isRead: false },
  { userId: 3, type: "task_status_changed", objectType: "task", objectId: 8, message: "Task 'Motion to compel' status changed to 'in progress'", isRead: false },
  { userId: 4, type: "task_status_changed", objectType: "task", objectId: 36, message: "Task 'Initial client consultation' status changed to 'completed'", isRead: true },
  { userId: 5, type: "task_status_changed", objectType: "task", objectId: 37, message: "Task 'File initial pleadings' status changed to 'completed'", isRead: true },
  
  // Case notifications
  { userId: 1, type: "case_phase_changed", objectType: "case", objectId: 1, message: "Case 'Smith Divorce Settlement' phase changed to 'intake'", isRead: false },
  { userId: 2, type: "case_phase_changed", objectType: "case", objectId: 14, message: "Case 'Downtown Real Estate Development' phase changed to 'litigation'", isRead: false },
  { userId: 3, type: "case_phase_changed", objectType: "case", objectId: 19, message: "Case 'Personal Injury - Car Accident' phase changed to 'settlement'", isRead: false },
  { userId: 4, type: "case_assigned", objectType: "case", objectId: 3, message: "You have been assigned to case: Employment Discrimination Claim", isRead: false },
  { userId: 5, type: "case_assigned", objectType: "case", objectId: 4, message: "You have been assigned to case: Dog Bite Injury Case", isRead: false },
  
  // Comment notifications
  { userId: 1, type: "comment_added", objectType: "task", objectId: 1, message: "New comment on task: Review financial disclosure documents", isRead: false },
  { userId: 2, type: "comment_added", objectType: "task", objectId: 4, message: "New comment on task: Negotiate with insurance adjuster", isRead: false },
  { userId: 3, type: "comment_added", objectType: "case", objectId: 5, message: "New comment on case: Custody Battle - Johnson Family", isRead: false },
  { userId: 4, type: "comment_added", objectType: "case", objectId: 14, message: "New comment on case: Downtown Real Estate Development", isRead: false },
  
  // Priority change notifications
  { userId: 1, type: "task_priority_changed", objectType: "task", objectId: 4, message: "Task 'Negotiate with insurance adjuster' priority changed to 'high'", isRead: false },
  { userId: 2, type: "task_priority_changed", objectType: "task", objectId: 47, message: "Task 'Overdue - File response' priority changed to 'urgent'", isRead: false },
];

// Create activity readers (many-to-many relationships) - expanded for all activities
const activityReaders = [
  // Case activities - assignees should see them
  { activityId: 1, userId: 1 }, { activityId: 1, userId: 2 }, { activityId: 1, userId: 3 }, // Case 1 created
  { activityId: 2, userId: 1 }, { activityId: 2, userId: 2 }, { activityId: 2, userId: 3 }, // Case 1 phase updated
  { activityId: 3, userId: 2 }, // Case 2 created
  { activityId: 4, userId: 3 }, { activityId: 4, userId: 4 }, // Case 3 created
  { activityId: 5, userId: 3 }, { activityId: 5, userId: 4 }, // Case 3 assigned
  { activityId: 6, userId: 4 }, // Case 4 created
  { activityId: 7, userId: 1 }, { activityId: 7, userId: 3 }, // Case 5 created
  { activityId: 8, userId: 1 }, { activityId: 8, userId: 3 }, // Case 5 phase updated
  { activityId: 9, userId: 1 }, { activityId: 9, userId: 2 }, { activityId: 9, userId: 5 }, // Case 14 created
  { activityId: 10, userId: 1 }, { activityId: 10, userId: 2 }, { activityId: 10, userId: 5 }, // Case 14 phase updated
  { activityId: 11, userId: 1 }, { activityId: 11, userId: 3 }, // Case 19 phase updated
  { activityId: 12, userId: 4 }, // Case 23 phase updated
  { activityId: 13, userId: 5 }, // Case 25 phase updated
  { activityId: 14, userId: 1 }, // Case 26 archived
  { activityId: 15, userId: 2 }, // Case 2 comment
  { activityId: 16, userId: 3 }, // Case 5 comment
  
  // Task activities - assignees and owners should see them
  { activityId: 17, userId: 1 }, { activityId: 17, userId: 2 }, // Task 1 created
  { activityId: 18, userId: 1 }, { activityId: 18, userId: 2 }, // Task 1 status updated
  { activityId: 19, userId: 2 }, { activityId: 19, userId: 3 }, // Task 2 created
  { activityId: 20, userId: 3 }, { activityId: 20, userId: 4 }, // Task 3 created
  { activityId: 21, userId: 3 }, { activityId: 21, userId: 4 }, // Task 3 status updated
  { activityId: 22, userId: 4 }, { activityId: 22, userId: 5 }, // Task 4 created
  { activityId: 23, userId: 4 }, { activityId: 23, userId: 5 }, // Task 4 priority changed
  { activityId: 24, userId: 5 }, // Task 5 created
  { activityId: 25, userId: 1 }, { activityId: 25, userId: 2 }, // Task 6 created
  { activityId: 26, userId: 1 }, { activityId: 26, userId: 2 }, // Task 6 status updated
  { activityId: 27, userId: 2 }, { activityId: 27, userId: 3 }, // Task 7 created
  { activityId: 28, userId: 3 }, { activityId: 28, userId: 4 }, // Task 8 created
  { activityId: 29, userId: 3 }, { activityId: 29, userId: 4 }, // Task 8 status updated
  { activityId: 30, userId: 4 }, // Task 41 created
  { activityId: 31, userId: 4 }, // Task 41 status updated
  { activityId: 32, userId: 5 }, // Task 42 created
  { activityId: 33, userId: 5 }, // Task 42 status updated
  { activityId: 34, userId: 1 }, // Task 36 created
  { activityId: 35, userId: 1 }, // Task 36 completed
  { activityId: 36, userId: 2 }, // Task 37 created
  { activityId: 37, userId: 2 }, // Task 37 completed
  { activityId: 38, userId: 3 }, // Task 38 created
  { activityId: 39, userId: 3 }, // Task 38 completed
  { activityId: 40, userId: 4 }, // Task 39 created
  { activityId: 41, userId: 4 }, // Task 39 completed
  { activityId: 42, userId: 5 }, // Task 40 created
  { activityId: 43, userId: 5 }, // Task 40 completed
  { activityId: 44, userId: 1 }, // Task 46 created
  { activityId: 45, userId: 2 }, // Task 47 created
  { activityId: 46, userId: 2 }, { activityId: 46, userId: 3 }, // Task 47 priority changed
];

// Create case assignments (many-to-many relationships) - diverse assignments
const caseAssignments = [
  // Case 1 - Multiple assignees
  { caseId: 1, userId: 1 }, { caseId: 1, userId: 2 }, { caseId: 1, userId: 3 },
  // Case 2 - Single assignee
  { caseId: 2, userId: 2 },
  // Case 3 - Two assignees
  { caseId: 3, userId: 3 }, { caseId: 3, userId: 4 },
  // Case 4 - Single assignee
  { caseId: 4, userId: 4 },
  // Case 5 - Multiple assignees
  { caseId: 5, userId: 1 }, { caseId: 5, userId: 3 },
  // Case 6 - Two assignees
  { caseId: 6, userId: 2 }, { caseId: 6, userId: 5 },
  // Case 7 - Single assignee
  { caseId: 7, userId: 3 },
  // Case 8 - Multiple assignees
  { caseId: 8, userId: 4 }, { caseId: 8, userId: 5 },
  // Case 9 - Single assignee
  { caseId: 9, userId: 5 },
  // Case 10 - Two assignees
  { caseId: 10, userId: 1 }, { caseId: 10, userId: 2 },
  // Case 11 - Single assignee
  { caseId: 11, userId: 2 },
  // Case 12 - Multiple assignees
  { caseId: 12, userId: 3 }, { caseId: 12, userId: 4 },
  // Case 13 - Single assignee
  { caseId: 13, userId: 4 },
  // Case 14 - Multiple assignees
  { caseId: 14, userId: 1 }, { caseId: 14, userId: 2 }, { caseId: 14, userId: 5 },
  // Case 15 - Two assignees
  { caseId: 15, userId: 2 }, { caseId: 15, userId: 3 },
  // Case 16 - Multiple assignees
  { caseId: 16, userId: 1 }, { caseId: 16, userId: 4 },
  // Case 17 - Single assignee
  { caseId: 17, userId: 3 },
  // Case 18 - Two assignees
  { caseId: 18, userId: 4 }, { caseId: 18, userId: 5 },
  // Case 19 - Multiple assignees
  { caseId: 19, userId: 1 }, { caseId: 19, userId: 3 },
  // Case 20 - Single assignee
  { caseId: 20, userId: 2 },
  // Case 21 - Two assignees
  { caseId: 21, userId: 3 }, { caseId: 21, userId: 4 },
  // Case 22 - Single assignee
  { caseId: 22, userId: 4 },
  // Case 23 - Single assignee (closed)
  { caseId: 23, userId: 1 },
  // Case 24 - Single assignee (closed)
  { caseId: 24, userId: 2 },
  // Case 25 - Two assignees (closed)
  { caseId: 25, userId: 1 }, { caseId: 25, userId: 3 },
  // Case 26 - Single assignee (closed)
  { caseId: 26, userId: 2 },
  // Case 27 - Two assignees
  { caseId: 27, userId: 3 }, { caseId: 27, userId: 5 },
  // Case 28 - Single assignee
  { caseId: 28, userId: 4 },
  // Case 29 - Two assignees
  { caseId: 29, userId: 1 }, { caseId: 29, userId: 5 },
];

// Create task assignments (many-to-many relationships) - diverse assignments for 50+ tasks
const taskAssignments = [
  // First 10 tasks - various assignments
  { taskId: 1, userId: 1 }, { taskId: 1, userId: 2 },
  { taskId: 2, userId: 2 }, { taskId: 2, userId: 3 },
  { taskId: 3, userId: 3 },
  { taskId: 4, userId: 4 }, { taskId: 4, userId: 5 },
  { taskId: 5, userId: 5 },
  { taskId: 6, userId: 1 }, { taskId: 6, userId: 2 },
  { taskId: 7, userId: 2 },
  { taskId: 8, userId: 3 }, { taskId: 8, userId: 4 },
  { taskId: 9, userId: 4 },
  { taskId: 10, userId: 5 },
  // Next 10 tasks
  { taskId: 11, userId: 1 }, { taskId: 11, userId: 3 },
  { taskId: 12, userId: 2 },
  { taskId: 13, userId: 3 }, { taskId: 13, userId: 4 },
  { taskId: 14, userId: 4 },
  { taskId: 15, userId: 5 },
  { taskId: 16, userId: 1 }, { taskId: 16, userId: 2 },
  { taskId: 17, userId: 2 }, { taskId: 17, userId: 3 },
  { taskId: 18, userId: 3 },
  { taskId: 19, userId: 4 },
  { taskId: 20, userId: 5 }, { taskId: 20, userId: 1 },
  // Next 10 tasks
  { taskId: 21, userId: 1 },
  { taskId: 22, userId: 2 }, { taskId: 22, userId: 3 },
  { taskId: 23, userId: 3 },
  { taskId: 24, userId: 4 },
  { taskId: 25, userId: 5 },
  { taskId: 26, userId: 1 }, { taskId: 26, userId: 2 },
  { taskId: 27, userId: 2 },
  { taskId: 28, userId: 3 }, { taskId: 28, userId: 4 },
  { taskId: 29, userId: 4 },
  { taskId: 30, userId: 5 },
  // Next 10 tasks
  { taskId: 31, userId: 1 }, { taskId: 31, userId: 3 },
  { taskId: 32, userId: 2 },
  { taskId: 33, userId: 3 },
  { taskId: 34, userId: 4 }, { taskId: 34, userId: 5 },
  { taskId: 35, userId: 5 },
  { taskId: 36, userId: 1 },
  { taskId: 37, userId: 2 }, { taskId: 37, userId: 3 },
  { taskId: 38, userId: 3 },
  { taskId: 39, userId: 4 },
  { taskId: 40, userId: 5 }, { taskId: 40, userId: 1 },
  // Remaining tasks
  { taskId: 41, userId: 1 },
  { taskId: 42, userId: 2 },
  { taskId: 43, userId: 3 }, { taskId: 43, userId: 4 },
  { taskId: 44, userId: 4 },
  { taskId: 45, userId: 5 },
  { taskId: 46, userId: 1 }, { taskId: 46, userId: 2 },
  { taskId: 47, userId: 2 },
  { taskId: 48, userId: 3 },
  { taskId: 49, userId: 4 }, { taskId: 49, userId: 5 },
  { taskId: 50, userId: 5 },
];

// Sync database and seed data
await db.sync({ alter: true }).then(async () => {
  console.log("Creating users...");
  const createdUsers = await User.bulkCreate(users);

  console.log("Creating cases...");
  const createdCases = await Case.bulkCreate(cases);

  console.log("Creating case-practice area relationships...");
  const casePracticeAreaRelations = [
    // Case 1 - Smith Divorce (intake)
    { caseId: 1, practiceAreaId: 1 }, // divorce
    { caseId: 1, practiceAreaId: 5 }, // spousal support
    // Case 2 - Estate Planning (intake)
    { caseId: 2, practiceAreaId: 14 }, // estate planning
    { caseId: 2, practiceAreaId: 15 }, // probate
    { caseId: 2, practiceAreaId: 16 }, // trust
    // Case 3 - Employment Discrimination (intake)
    { caseId: 3, practiceAreaId: 22 }, // employment law
    // Case 4 - Dog Bite (intake)
    { caseId: 4, practiceAreaId: 12 }, // dog bite
    { caseId: 4, practiceAreaId: 10 }, // personal injury - premise
    // Case 5 - Custody Battle (investigation)
    { caseId: 5, practiceAreaId: 2 }, // custody
    { caseId: 5, practiceAreaId: 4 }, // child custody
    { caseId: 5, practiceAreaId: 3 }, // child support
    // Case 6 - Premises Liability (investigation)
    { caseId: 6, practiceAreaId: 10 }, // personal injury - premise
    // Case 7 - Child Support (investigation)
    { caseId: 7, practiceAreaId: 3 }, // child support
    // Case 8 - Business Contract (investigation)
    { caseId: 8, practiceAreaId: 17 }, // business formation
    { caseId: 8, practiceAreaId: 21 }, // general civil litigation
    // Case 9 - PFA (investigation)
    { caseId: 9, practiceAreaId: 20 }, // PFA
    // Case 10 - Spousal Support (negotiation)
    { caseId: 10, practiceAreaId: 5 }, // spousal support
    { caseId: 10, practiceAreaId: 1 }, // divorce
    // Case 11 - Real Estate Purchase (negotiation)
    { caseId: 11, practiceAreaId: 6 }, // real estate - buyer
    // Case 12 - Personal Injury MVA (negotiation)
    { caseId: 12, practiceAreaId: 9 }, // personal injury - MVA
    // Case 13 - Probate (negotiation)
    { caseId: 13, practiceAreaId: 15 }, // probate
    { caseId: 13, practiceAreaId: 16 }, // trust
    // Case 14 - Real Estate Development (litigation)
    { caseId: 14, practiceAreaId: 8 }, // real estate - litigation
    // Case 15 - Products Liability (litigation)
    { caseId: 15, practiceAreaId: 13 }, // products liability
    { caseId: 15, practiceAreaId: 21 }, // general civil litigation
    // Case 16 - Complex Divorce (litigation)
    { caseId: 16, practiceAreaId: 1 }, // divorce
    { caseId: 16, practiceAreaId: 5 }, // spousal support
    // Case 17 - Employment Law (litigation)
    { caseId: 17, practiceAreaId: 22 }, // employment law
    // Case 18 - HOA Dispute (litigation)
    { caseId: 18, practiceAreaId: 18 }, // community association
    { caseId: 18, practiceAreaId: 21 }, // general civil litigation
    // Case 19 - Personal Injury Settlement (settlement)
    { caseId: 19, practiceAreaId: 9 }, // personal injury - MVA
    // Case 20 - Negligent Security (settlement)
    { caseId: 20, practiceAreaId: 11 }, // negligent security
    { caseId: 20, practiceAreaId: 10 }, // personal injury - premise
    // Case 21 - Property Damage (settlement)
    { caseId: 21, practiceAreaId: 19 }, // property damage
    // Case 22 - Trust Dispute (settlement)
    { caseId: 22, practiceAreaId: 16 }, // trust
    { caseId: 22, practiceAreaId: 15 }, // probate
    // Case 23 - Estate Planning (closed)
    { caseId: 23, practiceAreaId: 14 }, // estate planning
    // Case 24 - Business Formation (closed)
    { caseId: 24, practiceAreaId: 17 }, // business formation
    // Case 25 - Simple Divorce (closed)
    { caseId: 25, practiceAreaId: 1 }, // divorce
    // Case 26 - Real Estate Closing (closed)
    { caseId: 26, practiceAreaId: 6 }, // real estate - buyer
    // Case 27 - Foreign Judgment (litigation)
    { caseId: 27, practiceAreaId: 23 }, // foreign judgments
    { caseId: 27, practiceAreaId: 21 }, // general civil litigation
    // Case 28 - General Civil Litigation (investigation)
    { caseId: 28, practiceAreaId: 21 }, // general civil litigation
    // Case 29 - Child Custody Modification (negotiation)
    { caseId: 29, practiceAreaId: 4 }, // child custody
    { caseId: 29, practiceAreaId: 2 }, // custody
  ];

  await CasePracticeAreas.bulkCreate(casePracticeAreaRelations);

  console.log("Creating people...");
  const createdPeople = await Person.bulkCreate(people);

  console.log("Creating tasks...");
  const createdTasks = await Task.bulkCreate(tasks);

  console.log("Creating comments...");
  await Comment.bulkCreate(comments);

  console.log("Creating activity logs...");
  await ActivityLog.bulkCreate(activityLogs);

  console.log("Creating notifications...");
  await Notification.bulkCreate(notifications);

  console.log("Creating case assignments...");
  await CaseAssignees.bulkCreate(caseAssignments);

  console.log("Creating task assignments...");
  await TaskAssignees.bulkCreate(taskAssignments);

  console.log("Creating activity readers...");
  await ActivityReaders.bulkCreate(activityReaders);

  console.log("Database reset and seeded successfully!");
  console.log(
    `Created ${createdUsers.length} users, ${createdCases.length} cases, ${createdPeople.length} people, and ${createdTasks.length} tasks`,
  );
  console.log(
    `Created ${caseAssignments.length} case assignments, ${taskAssignments.length} task assignments, and ${activityReaders.length} activity readers`,
  );
});

await db.close();
