import connectToDB from "./db.js";
import {
  User,
  Task,
  Case,
  Person,
  CasePerson,
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
  AllowedEmails,
  EntryService,
  Rate,
} from "./model.js";

const db = await connectToDB(
  process.env.DATABASE_URL || "postgresql:///clg-db",
);

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

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

const allowedEmails = await AllowedEmails.bulkCreate([
  {
    email: "newguy@gmail.com",
  },
  {
    email: "newlady@gmail.com",
  },
]);

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

const tribunal = await Tribunal.bulkCreate([
  { name: "wayne" },
  { name: "pike" },
  { name: "monroe" },
  { name: "carbon" },
  { name: "luzerne" },
  { name: "lackawanna" },
  { name: "susquehanna" },
]);

// Practice area IDs (1-indexed, matching bulkCreate order)
const PA = {
  divorce: 1,
  custody: 2,
  childSupport: 3,
  childCustody: 4,
  spousalSupport: 5,
  reBuyer: 6,
  reSeller: 7,
  reLitigation: 8,
  piMva: 9,
  piPremise: 10,
  negligentSecurity: 11,
  dogBite: 12,
  productsLiability: 13,
  estatePlanning: 14,
  probate: 15,
  trust: 16,
  businessFormation: 17,
  communityAssociation: 18,
  propertyDamage: 19,
  pfa: 20,
  generalCivil: 21,
  employment: 22,
  foreignJudgments: 23,
};

const TRI = {
  wayne: 1,
  pike: 2,
  monroe: 3,
  carbon: 4,
  luzerne: 5,
  lackawanna: 6,
  susquehanna: 7,
};

const person = (overrides) => ({
  address: "100 Main Street",
  city: "Honesdale",
  state: "PA",
  zip: "18431",
  phoneNumber: "5705550100",
  dob: "1980-01-15",
  county: "Wayne",
  SSN: "123456789",
  type: "client",
  ...overrides,
});

const task = (overrides) => ({
  ownerId: 1,
  notes: "",
  dueDate: daysFromNow(7),
  priority: "normal",
  status: "not started",
  assigneeIds: [overrides.ownerId || 1],
  ...overrides,
});

const caseSeeds = [
  {
    ownerId: 1,
    title: "Smith v. Smith Divorce",
    notes:
      "High-conflict divorce. Marital estate includes a family HVAC business, the Honesdale residence, and a rental in Hawley.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.divorce, PA.custody],
    tribunalId: TRI.wayne,
    assigneeIds: [1, 2],
    people: [
      person({
        firstName: "John",
        lastName: "Smith",
        address: "123 Oak Street",
        city: "Honesdale",
        zip: "18431",
        phoneNumber: "5705550101",
        dob: "1980-03-15",
        county: "Wayne",
        type: "client",
      }),
      person({
        firstName: "Mary",
        lastName: "Smith",
        address: "456 Maple Avenue",
        city: "Honesdale",
        zip: "18431",
        phoneNumber: "5705550102",
        dob: "1982-07-22",
        county: "Wayne",
        type: "opposing",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "Review financial disclosure documents",
        notes:
          "Analyze Smith HVAC financials and the Hawley rental for equitable distribution.",
        dueDate: daysFromNow(3),
        priority: "high",
        status: "in progress",
        assigneeIds: [1, 2],
      }),
      task({
        ownerId: 2,
        title: "Draft proposed parenting schedule",
        notes: "School-year vs summer schedule for the two minor children.",
        dueDate: daysFromNow(8),
        priority: "normal",
        status: "not started",
        assigneeIds: [2],
      }),
    ],
  },
  {
    ownerId: 2,
    title: "Chen Mixed-Use Zoning Appeal",
    notes:
      "Appeal of Monroe County zoning denial for a mixed-use building on Main Street, Stroudsburg.",
    phase: "litigation",
    isArchived: false,
    practiceAreaIds: [PA.reLitigation],
    tribunalId: TRI.monroe,
    assigneeIds: [2, 5],
    people: [
      person({
        firstName: "Robert",
        lastName: "Chen",
        address: "789 Business Blvd",
        city: "Stroudsburg",
        zip: "18360",
        phoneNumber: "5705550201",
        dob: "1975-11-08",
        county: "Monroe",
      }),
    ],
    tasks: [
      task({
        ownerId: 2,
        title: "File land use appeal brief",
        notes: "Due before the next Court of Common Pleas listing.",
        dueDate: daysFromNow(1),
        priority: "urgent",
        status: "not started",
        assigneeIds: [2, 5],
      }),
      task({
        ownerId: 5,
        title: "Research recent zoning precedents",
        notes: "Find comparable Monroe and Pike mixed-use approvals.",
        dueDate: daysFromNow(4),
        priority: "normal",
        status: "in progress",
        assigneeIds: [5],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Johnson Custody Relocation",
    notes:
      "Mother seeks to relocate from Wilkes-Barre to Allentown. Father opposes change of school district.",
    phase: "investigation",
    isArchived: false,
    practiceAreaIds: [PA.custody, PA.childCustody],
    tribunalId: TRI.luzerne,
    assigneeIds: [3, 1],
    people: [
      person({
        firstName: "Amanda",
        lastName: "Johnson",
        address: "321 Family Circle",
        city: "Wilkes-Barre",
        zip: "18701",
        phoneNumber: "5705550301",
        dob: "1988-05-14",
        county: "Luzerne",
      }),
      person({
        firstName: "Michael",
        lastName: "Johnson",
        address: "654 Parent Lane",
        city: "Kingston",
        zip: "18704",
        phoneNumber: "5705550302",
        dob: "1986-09-30",
        county: "Luzerne",
        type: "opposing",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Interview child's teacher and counselor",
        notes: "Document academic performance and emotional well-being.",
        dueDate: daysFromNow(5),
        priority: "normal",
        status: "not started",
        assigneeIds: [1],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Martinez Multi-Vehicle Collision",
    notes:
      "Three-car crash on I-81 near Scranton. Client has lumbar fusion and disputed wage loss.",
    phase: "settlement",
    isArchived: false,
    isBillable: true,
    sol: daysFromNow(220),
    practiceAreaIds: [PA.piMva],
    tribunalId: TRI.lackawanna,
    assigneeIds: [4, 3],
    people: [
      person({
        firstName: "Carlos",
        lastName: "Martinez",
        address: "987 Hospital Drive",
        city: "Scranton",
        zip: "18503",
        phoneNumber: "5705550401",
        dob: "1990-12-03",
        county: "Lackawanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Negotiate with insurance adjuster",
        notes: "Counter $50K offer with $175K based on medical specials.",
        dueDate: daysFromNow(2),
        priority: "high",
        status: "in progress",
        assigneeIds: [4, 3],
      }),
    ],
  },
  {
    ownerId: 5,
    title: "Whitaker Revocable Living Trust",
    notes:
      "Couple updating estate plan: pour-over will, revocable trust, and healthcare POAs.",
    phase: "intake",
    isArchived: false,
    practiceAreaIds: [PA.estatePlanning, PA.trust],
    tribunalId: TRI.pike,
    assigneeIds: [5, 1],
    people: [
      person({
        firstName: "Helen",
        lastName: "Whitaker",
        address: "44 Lakeview Drive",
        city: "Milford",
        zip: "18337",
        phoneNumber: "5705550501",
        dob: "1952-04-18",
        county: "Pike",
      }),
    ],
    tasks: [
      task({
        ownerId: 5,
        title: "Intake meeting and asset inventory",
        notes: "Collect deeds, beneficiary designations, and retirement accounts.",
        dueDate: daysFromNow(6),
        priority: "normal",
        status: "not started",
        assigneeIds: [5],
      }),
    ],
  },
  {
    ownerId: 1,
    title: "Brennan Child Support Modification",
    notes:
      "Obligor lost overtime at the packing plant; seeking downward modification.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.childSupport],
    tribunalId: TRI.carbon,
    assigneeIds: [1, 2],
    people: [
      person({
        firstName: "Patrick",
        lastName: "Brennan",
        address: "18 Coal Street",
        city: "Jim Thorpe",
        zip: "18229",
        phoneNumber: "5705550601",
        dob: "1984-02-11",
        county: "Carbon",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "Prepare support guideline worksheet",
        notes: "Use new paystubs and daycare receipts.",
        dueDate: daysFromNow(4),
        priority: "high",
        status: "in progress",
        assigneeIds: [1, 2],
      }),
    ],
  },
  {
    ownerId: 2,
    title: "Kowalski Lake House Purchase",
    notes: "Cash buyer on Lake Wallenpaupack. Title exception for an old ROW.",
    phase: "intake",
    isArchived: false,
    practiceAreaIds: [PA.reBuyer],
    tribunalId: TRI.pike,
    assigneeIds: [2, 5],
    people: [
      person({
        firstName: "Anna",
        lastName: "Kowalski",
        address: "9 Dockside Court",
        city: "Hawley",
        zip: "18428",
        phoneNumber: "5705550701",
        dob: "1978-08-09",
        county: "Pike",
      }),
    ],
    tasks: [
      task({
        ownerId: 2,
        title: "Review title commitment and survey",
        notes: "Clear the ROW exception before the Friday closing.",
        dueDate: daysFromNow(2),
        priority: "urgent",
        status: "not started",
        assigneeIds: [2],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Alvarez Grocery Store Slip and Fall",
    notes:
      "Client slipped on unmarked produce residue at a Hazleton supermarket. Video requested.",
    phase: "investigation",
    isArchived: false,
    sol: daysFromNow(400),
    practiceAreaIds: [PA.piPremise],
    tribunalId: TRI.luzerne,
    assigneeIds: [4, 2],
    people: [
      person({
        firstName: "Rosa",
        lastName: "Alvarez",
        address: "55 Wyoming Street",
        city: "Hazleton",
        zip: "18201",
        phoneNumber: "5705550801",
        dob: "1969-06-21",
        county: "Luzerne",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Send spoliation letter for store video",
        notes: "Preserve 30 days of camera footage from aisle 4.",
        dueDate: daysFromNow(1),
        priority: "urgent",
        status: "in progress",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 1,
    title: "Patel Spousal Support Arrears",
    notes: "Collecting $18k in arrears after payor left a union job for cash work.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.spousalSupport],
    tribunalId: TRI.wayne,
    assigneeIds: [1, 4],
    people: [
      person({
        firstName: "Priya",
        lastName: "Patel",
        address: "200 Church Street",
        city: "Honesdale",
        zip: "18431",
        phoneNumber: "5705550901",
        dob: "1985-01-30",
        county: "Wayne",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "File contempt petition for support arrears",
        notes: "Attach DRO printout and job-search correspondence.",
        dueDate: daysFromNow(9),
        priority: "high",
        status: "not started",
        assigneeIds: [1],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Valley View HOA Special Assessment",
    notes:
      "Board seeks to collect a roof assessment from two delinquent unit owners.",
    phase: "litigation",
    isArchived: false,
    practiceAreaIds: [PA.communityAssociation],
    tribunalId: TRI.monroe,
    assigneeIds: [3, 5],
    people: [
      person({
        firstName: "Diane",
        lastName: "Foster",
        address: "12 Ridge Road",
        city: "Mount Pocono",
        zip: "18344",
        phoneNumber: "5705551001",
        dob: "1964-09-12",
        county: "Monroe",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Draft complaint for unpaid assessments",
        notes: "Include declaration excerpts and ledger.",
        dueDate: daysFromNow(6),
        priority: "normal",
        status: "in progress",
        assigneeIds: [3, 5],
      }),
    ],
  },
  {
    ownerId: 5,
    title: "Russo Dog Bite at Neighborhood Park",
    notes:
      "Off-leash shepherd mix bit a child at a Montrose borough park. Homeowner policy identified.",
    phase: "investigation",
    isArchived: false,
    sol: daysFromNow(500),
    practiceAreaIds: [PA.dogBite],
    tribunalId: TRI.susquehanna,
    assigneeIds: [5, 4],
    people: [
      person({
        firstName: "Elena",
        lastName: "Russo",
        address: "77 Cherry Street",
        city: "Montrose",
        zip: "18801",
        phoneNumber: "5705551101",
        dob: "1992-03-08",
        county: "Susquehanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 5,
        title: "Obtain animal control and ER records",
        notes: "Need rabies tag info and treating physician notes.",
        dueDate: daysFromNow(7),
        priority: "normal",
        status: "not started",
        assigneeIds: [5],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Novak Emergency PFA",
    notes:
      "Final PFA hearing after an emergency order. Client has photos and text messages.",
    phase: "litigation",
    isArchived: false,
    isBillable: false,
    practiceAreaIds: [PA.pfa],
    tribunalId: TRI.lackawanna,
    assigneeIds: [4, 1],
    people: [
      person({
        firstName: "Megan",
        lastName: "Novak",
        address: "410 Adams Avenue",
        city: "Scranton",
        zip: "18503",
        phoneNumber: "5705551201",
        dob: "1993-11-19",
        county: "Lackawanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Prepare PFA hearing exhibit binder",
        notes: "Texts, photos, and 911 call summary.",
        dueDate: daysFromNow(2),
        priority: "urgent",
        status: "in progress",
        assigneeIds: [4, 1],
      }),
    ],
  },
  {
    ownerId: 2,
    title: "Callahan Landscaping LLC Formation",
    notes:
      "Two brothers forming an LLC, operating agreement, and EIN filing for a Stroudsburg landscaping company.",
    phase: "intake",
    isArchived: false,
    practiceAreaIds: [PA.businessFormation],
    assigneeIds: [2, 3],
    people: [
      person({
        firstName: "Brian",
        lastName: "Callahan",
        address: "88 Park Avenue",
        city: "East Stroudsburg",
        zip: "18301",
        phoneNumber: "5705551301",
        dob: "1987-07-04",
        county: "Monroe",
      }),
    ],
    tasks: [
      task({
        ownerId: 2,
        title: "Draft operating agreement and file certificate",
        notes: "Confirm capital contributions and voting split.",
        dueDate: daysFromNow(10),
        priority: "normal",
        status: "not started",
        assigneeIds: [2],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Delaney Wrongful Termination",
    notes:
      "Warehouse supervisor fired after reporting overtime off-the-clock. Possible PHRC claim.",
    phase: "investigation",
    isArchived: false,
    practiceAreaIds: [PA.employment],
    tribunalId: TRI.luzerne,
    assigneeIds: [3, 4],
    people: [
      person({
        firstName: "Kevin",
        lastName: "Delaney",
        address: "16 Kidder Street",
        city: "Wilkes-Barre",
        zip: "18702",
        phoneNumber: "5705551401",
        dob: "1979-05-27",
        county: "Luzerne",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Collect personnel file and time records",
        notes: "Demand letter to HR; calendar PHRC deadline.",
        dueDate: daysFromNow(5),
        priority: "high",
        status: "blocked",
        assigneeIds: [3],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "O'Brien Defective Pressure Cooker",
    notes:
      "Burns from a failed lid lock. Manufacturer in Ohio; need to preserve the unit.",
    phase: "litigation",
    isArchived: false,
    sol: daysFromNow(310),
    practiceAreaIds: [PA.productsLiability],
    tribunalId: TRI.carbon,
    assigneeIds: [4, 3],
    people: [
      person({
        firstName: "Shannon",
        lastName: "O'Brien",
        address: "3 Race Street",
        city: "Lehighton",
        zip: "18235",
        phoneNumber: "5705551501",
        dob: "1981-10-02",
        county: "Carbon",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Arrange product inspection with expert",
        notes: "Coordinate with opposing counsel for a joint exam.",
        dueDate: daysFromNow(12),
        priority: "high",
        status: "not started",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 5,
    title: "Miller Family Trust Dispute",
    notes:
      "Siblings contesting trustee's sale of a Wayne County farm. Accounting requested.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.trust],
    tribunalId: TRI.wayne,
    assigneeIds: [5, 1],
    people: [
      person({
        firstName: "Thomas",
        lastName: "Miller",
        address: "500 Farm Road",
        city: "Honesdale",
        zip: "18431",
        phoneNumber: "5705551601",
        dob: "1958-12-14",
        county: "Wayne",
      }),
    ],
    tasks: [
      task({
        ownerId: 5,
        title: "Demand formal trust accounting",
        notes: "Cover the last five years of farm income and distributions.",
        dueDate: daysFromNow(8),
        priority: "normal",
        status: "in progress",
        assigneeIds: [5, 1],
      }),
    ],
  },
  {
    ownerId: 1,
    title: "Torres Probate Administration",
    notes:
      "Intestate estate. Decedent owned a Pike County cabin and a small brokerage account.",
    phase: "investigation",
    isArchived: false,
    practiceAreaIds: [PA.probate],
    tribunalId: TRI.pike,
    assigneeIds: [1, 5],
    people: [
      person({
        firstName: "Lucia",
        lastName: "Torres",
        address: "27 Broad Street",
        city: "Milford",
        zip: "18337",
        phoneNumber: "5705551701",
        dob: "1971-08-16",
        county: "Pike",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "Prepare petition for letters of administration",
        notes: "Need original death certificate and heir affidavits.",
        dueDate: daysFromNow(3),
        priority: "high",
        status: "not started",
        assigneeIds: [1],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Griffin Nightclub Assault",
    notes:
      "Patron assaulted outside a Scranton nightclub. Alleged inadequate security and lighting.",
    phase: "litigation",
    isArchived: false,
    sol: daysFromNow(180),
    practiceAreaIds: [PA.negligentSecurity],
    tribunalId: TRI.lackawanna,
    assigneeIds: [3, 4],
    people: [
      person({
        firstName: "James",
        lastName: "Griffin",
        address: "90 Penn Avenue",
        city: "Scranton",
        zip: "18503",
        phoneNumber: "5705551801",
        dob: "1995-02-28",
        county: "Lackawanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Serve written discovery on club owner",
        notes: "Incident reports, staffing logs, and camera footage.",
        dueDate: daysFromNow(11),
        priority: "high",
        status: "not started",
        assigneeIds: [3],
      }),
      task({
        ownerId: 4,
        title: "Schedule client IME follow-up",
        notes: "Client still treating for orbital fracture.",
        dueDate: daysFromNow(18),
        priority: "low",
        status: "not started",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 2,
    title: "Walsh Mountain Cabin Sale",
    notes: "Seller-side residential closing in Promised Land area. Buyer financing.",
    phase: "intake",
    isArchived: false,
    practiceAreaIds: [PA.reSeller],
    tribunalId: TRI.wayne,
    assigneeIds: [2, 1],
    people: [
      person({
        firstName: "Carol",
        lastName: "Walsh",
        address: "14 Pine Road",
        city: "Greentown",
        zip: "18426",
        phoneNumber: "5705551901",
        dob: "1966-04-03",
        county: "Wayne",
      }),
    ],
    tasks: [
      task({
        ownerId: 2,
        title: "Prepare seller disclosures and deed",
        notes: "Confirm septic cert and well test.",
        dueDate: daysFromNow(14),
        priority: "normal",
        status: "not started",
        assigneeIds: [2],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Santos Dominican Judgment Enforcement",
    notes:
      "Domesticate a Dominican Republic money judgment against a Monroe County debtor.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.foreignJudgments],
    tribunalId: TRI.monroe,
    assigneeIds: [4, 2],
    people: [
      person({
        firstName: "Mateo",
        lastName: "Santos",
        address: "61 Analomink Street",
        city: "East Stroudsburg",
        zip: "18301",
        phoneNumber: "5705552001",
        dob: "1974-09-25",
        county: "Monroe",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "File foreign judgment and notice of filing",
        notes: "Certified translation already received.",
        dueDate: daysFromNow(6),
        priority: "normal",
        status: "in progress",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 1,
    title: "Kowalski Custody Relocation Hearing",
    notes:
      "Related to the lake-house family. Father seeks to relocate children to New Jersey.",
    phase: "litigation",
    isArchived: false,
    practiceAreaIds: [PA.childCustody],
    tribunalId: TRI.luzerne,
    assigneeIds: [1, 2],
    people: [
      person({
        firstName: "Daniel",
        lastName: "Kowalski",
        address: "8 River Street",
        city: "Pittston",
        zip: "18640",
        phoneNumber: "5705552101",
        dob: "1983-06-17",
        county: "Luzerne",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "Outline relocation factors for hearing memo",
        notes: "Focus on school comparison and extended family in NJ.",
        dueDate: daysFromNow(4),
        priority: "urgent",
        status: "in progress",
        assigneeIds: [1, 2],
      }),
    ],
  },
  {
    ownerId: 5,
    title: "Hernandez Storm Damage Claim",
    notes:
      "Wind took a barn roof in Susquehanna County. Carrier delayed under an earth-movement exclusion.",
    phase: "settlement",
    isArchived: false,
    practiceAreaIds: [PA.propertyDamage],
    tribunalId: TRI.susquehanna,
    assigneeIds: [5, 3],
    people: [
      person({
        firstName: "Luis",
        lastName: "Hernandez",
        address: "240 Creek Road",
        city: "Forest City",
        zip: "18421",
        phoneNumber: "5705552201",
        dob: "1970-01-09",
        county: "Susquehanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 5,
        title: "Review public adjuster estimate vs carrier denial",
        notes: "Prepare a coverage letter citing wind vs earth movement.",
        dueDate: daysFromNow(-2),
        priority: "high",
        status: "in progress",
        assigneeIds: [5],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Barrett Construction Contract Dispute",
    notes:
      "Homeowner vs contractor over unfinished kitchen addition in Jim Thorpe. Mechanics' lien filed.",
    phase: "litigation",
    isArchived: false,
    practiceAreaIds: [PA.generalCivil],
    tribunalId: TRI.carbon,
    assigneeIds: [3, 2],
    people: [
      person({
        firstName: "Nicole",
        lastName: "Barrett",
        address: "19 Center Street",
        city: "Jim Thorpe",
        zip: "18229",
        phoneNumber: "5705552301",
        dob: "1986-11-05",
        county: "Carbon",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Answer complaint and assert lien counterclaim",
        notes: "Response deadline is next week.",
        dueDate: daysFromNow(5),
        priority: "urgent",
        status: "not started",
        assigneeIds: [3],
      }),
    ],
  },
  {
    ownerId: 2,
    title: "Peters Parenting Plan Mediation",
    notes:
      "Unmarried parents agreeing to a custody stipulation before filing.",
    phase: "negotiation",
    isArchived: false,
    practiceAreaIds: [PA.childCustody, PA.custody],
    tribunalId: TRI.pike,
    assigneeIds: [2, 1],
    people: [
      person({
        firstName: "Lauren",
        lastName: "Peters",
        address: "33 Harford Street",
        city: "Milford",
        zip: "18337",
        phoneNumber: "5705552401",
        dob: "1991-07-13",
        county: "Pike",
      }),
    ],
    tasks: [
      task({
        ownerId: 2,
        title: "Circulate draft custody stipulation",
        notes: "Include holiday rotation and right of first refusal.",
        dueDate: daysFromNow(7),
        priority: "normal",
        status: "not started",
        assigneeIds: [2, 1],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Nguyen Rear-End Collision",
    notes:
      "Stopped at a Dunmore light and rear-ended. Soft-tissue injuries; PIP exhausted.",
    phase: "investigation",
    isArchived: false,
    sol: daysFromNow(610),
    practiceAreaIds: [PA.piMva],
    tribunalId: TRI.lackawanna,
    assigneeIds: [4, 5],
    people: [
      person({
        firstName: "Linh",
        lastName: "Nguyen",
        address: "102 Drinker Street",
        city: "Dunmore",
        zip: "18512",
        phoneNumber: "5705552501",
        dob: "1989-03-22",
        county: "Lackawanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Request crash report and medical records",
        notes: "PSP report plus chiro and PCP records.",
        dueDate: daysFromNow(3),
        priority: "normal",
        status: "in progress",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 1,
    title: "Oldham Divorce Decree",
    notes: "Decree entered; QDRO completed. Matter closed and archived.",
    phase: "closed",
    isArchived: true,
    practiceAreaIds: [PA.divorce],
    tribunalId: TRI.wayne,
    assigneeIds: [1, 2],
    people: [
      person({
        firstName: "Rebecca",
        lastName: "Oldham",
        address: "70 Park Street",
        city: "Honesdale",
        zip: "18431",
        phoneNumber: "5705552601",
        dob: "1977-02-02",
        county: "Wayne",
      }),
    ],
    tasks: [
      task({
        ownerId: 1,
        title: "Close file and return original documents",
        notes: "Mail decree and QDRO copies to client.",
        dueDate: daysFromNow(-30),
        priority: "low",
        status: "completed",
        assigneeIds: [1],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "Pike County Quiet Title",
    notes: "Quiet title after a tax sale. Judgment entered; archived.",
    phase: "closed",
    isArchived: true,
    practiceAreaIds: [PA.reLitigation],
    tribunalId: TRI.pike,
    assigneeIds: [3, 2],
    people: [
      person({
        firstName: "Harold",
        lastName: "Greene",
        address: "5 High Street",
        city: "Milford",
        zip: "18337",
        phoneNumber: "5705552701",
        dob: "1955-08-20",
        county: "Pike",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Record quiet title judgment",
        notes: "Recorded in Pike County Recorder of Deeds.",
        dueDate: daysFromNow(-60),
        priority: "normal",
        status: "completed",
        assigneeIds: [3],
      }),
    ],
  },
  {
    ownerId: 5,
    title: "Brennan Estate Administration Closed",
    notes: "Final accounting approved. Distributions complete.",
    phase: "closed",
    isArchived: true,
    practiceAreaIds: [PA.probate],
    tribunalId: TRI.carbon,
    assigneeIds: [5, 1],
    people: [
      person({
        firstName: "Margaret",
        lastName: "Brennan",
        address: "41 Bridge Street",
        city: "Lehighton",
        zip: "18235",
        phoneNumber: "5705552801",
        dob: "1948-12-01",
        county: "Carbon",
      }),
    ],
    tasks: [
      task({
        ownerId: 5,
        title: "File petition for discharge of executrix",
        notes: "Court granted discharge last month.",
        dueDate: daysFromNow(-45),
        priority: "normal",
        status: "completed",
        assigneeIds: [5],
      }),
    ],
  },
  {
    ownerId: 4,
    title: "Yates Premises Settlement",
    notes: "Icy parking lot fall settled with the carrier. Release signed.",
    phase: "settlement",
    isArchived: true,
    practiceAreaIds: [PA.piPremise],
    tribunalId: TRI.luzerne,
    assigneeIds: [4, 3],
    people: [
      person({
        firstName: "Dorothy",
        lastName: "Yates",
        address: "200 South Main Street",
        city: "Wilkes-Barre",
        zip: "18701",
        phoneNumber: "5705552901",
        dob: "1942-05-18",
        county: "Luzerne",
      }),
    ],
    tasks: [
      task({
        ownerId: 4,
        title: "Process settlement check and closing statement",
        notes: "Liens resolved; funds disbursed.",
        dueDate: daysFromNow(-20),
        priority: "high",
        status: "completed",
        assigneeIds: [4],
      }),
    ],
  },
  {
    ownerId: 3,
    title: "TechStart Asset Purchase",
    notes:
      "Closed asset purchase of a small software shop. Post-closing escrow released.",
    phase: "closed",
    isArchived: true,
    practiceAreaIds: [PA.businessFormation, PA.generalCivil],
    assigneeIds: [3, 5],
    people: [
      person({
        firstName: "David",
        lastName: "Rodriguez",
        address: "777 Tech Tower",
        city: "Scranton",
        zip: "18503",
        phoneNumber: "5705553001",
        dob: "1968-08-25",
        county: "Lackawanna",
      }),
    ],
    tasks: [
      task({
        ownerId: 3,
        title: "Confirm escrow release and archive deal file",
        notes: "All post-closing conditions satisfied.",
        dueDate: daysFromNow(-90),
        priority: "low",
        status: "completed",
        assigneeIds: [3, 5],
      }),
    ],
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

await db.sync({ alter: true }).then(async () => {
  console.log("Creating users...");
  const createdUsers = await User.bulkCreate(users);

  console.log("Creating cases...");
  const createdCases = await Case.bulkCreate(
    caseSeeds.map(
      ({
        people,
        tasks,
        practiceAreaIds,
        tribunalId,
        assigneeIds,
        ...caseFields
      }) => caseFields,
    ),
  );

  console.log("Creating case-practice area relationships...");
  await CasePracticeAreas.bulkCreate(
    caseSeeds.flatMap((seed, i) =>
      seed.practiceAreaIds.map((practiceAreaId) => ({
        caseId: createdCases[i].caseId,
        practiceAreaId,
      })),
    ),
  );

  console.log("Creating case-tribunal relationships...");
  await CaseTribunal.bulkCreate(
    caseSeeds.flatMap((seed, i) =>
      seed.tribunalId
        ? [
            {
              caseId: createdCases[i].caseId,
              tribunalId: seed.tribunalId,
            },
          ]
        : [],
    ),
  );

  console.log("Creating people...");
  const peopleToCreate = caseSeeds.flatMap((seed, i) =>
    seed.people.map((p) => ({
      ...p,
      caseId: createdCases[i].caseId,
    })),
  );
  const createdPeople = await Person.bulkCreate(
    peopleToCreate.map(({ caseId, type, ...rest }) => rest),
  );
  await CasePerson.bulkCreate(
    createdPeople.map((created, i) => ({
      caseId: peopleToCreate[i].caseId,
      personId: created.personId,
      type: peopleToCreate[i].type,
    })),
  );

  console.log("Creating tasks...");
  const tasksToCreate = caseSeeds.flatMap((seed, i) =>
    seed.tasks.map((t) => ({
      ...t,
      caseId: createdCases[i].caseId,
    })),
  );
  const createdTasks = await Task.bulkCreate(
    tasksToCreate.map(({ assigneeIds, ...rest }) => rest),
  );

  const caseByTitle = Object.fromEntries(
    createdCases.map((c) => [c.title, c]),
  );
  const taskByTitle = Object.fromEntries(
    createdTasks.map((t) => [t.title, t]),
  );

  console.log("Creating comments...");
  await Comment.bulkCreate([
    {
      authorId: 1,
      objectType: "task",
      objectId: taskByTitle["Review financial disclosure documents"].taskId,
      content:
        "Financial documents received from client. Need to verify authenticity of the HVAC business valuations.",
    },
    {
      authorId: 2,
      objectType: "task",
      objectId: taskByTitle["Review financial disclosure documents"].taskId,
      content:
        "I'll review the valuation reports tomorrow. Meg, can you forward the tax returns?",
    },
    {
      authorId: 3,
      objectType: "case",
      objectId: caseByTitle["Johnson Custody Relocation"].caseId,
      content:
        "Client mentioned concerns about the child's relationship with father. Need to document this for the custody evaluation.",
    },
    {
      authorId: 4,
      objectType: "task",
      objectId: taskByTitle["Negotiate with insurance adjuster"].taskId,
      content:
        "Insurance company offered $50K. Client wants to counter based on the fusion and lost overtime.",
    },
    {
      authorId: 5,
      objectType: "case",
      objectId: caseByTitle["Chen Mixed-Use Zoning Appeal"].caseId,
      content:
        "Zoning board meeting is next Thursday. Need presentation boards and the traffic study.",
    },
    {
      authorId: 1,
      objectType: "case",
      objectId: caseByTitle["Novak Emergency PFA"].caseId,
      content:
        "Final PFA listing confirmed. Client will bring printed copies of the texts.",
    },
    {
      authorId: 3,
      objectType: "task",
      objectId: taskByTitle["Collect personnel file and time records"].taskId,
      content:
        "HR still has not produced the personnel file. Follow up before we file with PHRC.",
    },
  ]);

  console.log("Creating activity logs...");
  const createdActivity = await ActivityLog.bulkCreate([
    {
      authorId: 1,
      objectType: "task",
      objectId: taskByTitle["Review financial disclosure documents"].taskId,
      action: "task_created",
      details: "Created task: Review financial disclosure documents",
    },
    {
      authorId: 2,
      objectType: "task",
      objectId: taskByTitle["Review financial disclosure documents"].taskId,
      action: "status_updated",
      details: "Updated task status to 'in progress'",
    },
    {
      authorId: 3,
      objectType: "case",
      objectId: caseByTitle["Johnson Custody Relocation"].caseId,
      action: "case_assigned",
      details: "Assigned custody case to Meg Williams",
    },
    {
      authorId: 1,
      objectType: "case",
      objectId: caseByTitle["Smith v. Smith Divorce"].caseId,
      action: "phase_updated",
      details: "changed case phase to negotiation",
    },
    {
      authorId: 2,
      objectType: "case",
      objectId: caseByTitle["Chen Mixed-Use Zoning Appeal"].caseId,
      action: "phase_updated",
      details: "changed case phase to litigation",
    },
    {
      authorId: 1,
      objectType: "case",
      objectId: caseByTitle["Smith v. Smith Divorce"].caseId,
      action: "priority_update",
      details: "changed case priority to high",
    },
    {
      authorId: 3,
      objectType: "case",
      objectId: caseByTitle["Smith v. Smith Divorce"].caseId,
      action: "case_created",
      details: "Case opened by Meg Williams",
    },
    {
      authorId: 4,
      objectType: "task",
      objectId: taskByTitle["Negotiate with insurance adjuster"].taskId,
      action: "priority_changed",
      details: "Changed task priority from 'normal' to 'high'",
    },
    {
      authorId: 5,
      objectType: "case",
      objectId: caseByTitle["Chen Mixed-Use Zoning Appeal"].caseId,
      action: "comment_added",
      details: "Added comment about zoning board meeting",
    },
    {
      authorId: 4,
      objectType: "case",
      objectId: caseByTitle["Novak Emergency PFA"].caseId,
      action: "phase_updated",
      details: "changed case phase to litigation",
    },
    {
      authorId: 1,
      objectType: "case",
      objectId: caseByTitle["Oldham Divorce Decree"].caseId,
      action: "case_archived",
      details: "Archived Oldham Divorce Decree",
    },
  ]);

  console.log("Creating notifications...");
  await Notification.bulkCreate([
    {
      userId: 2,
      type: "assignment",
      objectType: "task",
      objectId: taskByTitle["File land use appeal brief"].taskId,
      message: "You have been assigned to: File land use appeal brief",
      isRead: false,
    },
    {
      userId: 1,
      type: "due_date",
      objectType: "task",
      objectId: taskByTitle["Interview child's teacher and counselor"].taskId,
      message:
        "Task 'Interview child's teacher and counselor' is due in 5 days",
      isRead: false,
    },
    {
      userId: 1,
      type: "status_change",
      objectType: "case",
      objectId: caseByTitle["Smith v. Smith Divorce"].caseId,
      message: "Case 'Smith v. Smith Divorce' has new activity",
      isRead: false,
    },
    {
      userId: 4,
      type: "comment",
      objectType: "task",
      objectId: taskByTitle["Negotiate with insurance adjuster"].taskId,
      message: "New comment on task: Negotiate with insurance adjuster",
      isRead: false,
    },
    {
      userId: 5,
      type: "assignment",
      objectType: "case",
      objectId: caseByTitle["Whitaker Revocable Living Trust"].caseId,
      message: "You have been assigned to: Whitaker Revocable Living Trust",
      isRead: false,
    },
  ]);

  console.log("Creating case assignments...");
  await CaseAssignees.bulkCreate(
    caseSeeds.flatMap((seed, i) =>
      seed.assigneeIds.map((userId) => ({
        caseId: createdCases[i].caseId,
        userId,
      })),
    ),
  );

  console.log("Creating task assignments...");
  await TaskAssignees.bulkCreate(
    tasksToCreate.flatMap((t, i) =>
      (t.assigneeIds || []).map((userId) => ({
        taskId: createdTasks[i].taskId,
        userId,
      })),
    ),
  );

  console.log("Creating activity readers...");
  await ActivityReaders.bulkCreate([
    { activityId: createdActivity[0].activityId, userId: 2 },
    { activityId: createdActivity[0].activityId, userId: 3 },
    { activityId: createdActivity[1].activityId, userId: 1 },
    { activityId: createdActivity[2].activityId, userId: 1 },
    { activityId: createdActivity[2].activityId, userId: 4 },
    { activityId: createdActivity[3].activityId, userId: 1 },
    { activityId: createdActivity[4].activityId, userId: 2 },
    { activityId: createdActivity[9].activityId, userId: 1 },
    { activityId: createdActivity[9].activityId, userId: 4 },
    { activityId: createdActivity[10].activityId, userId: 1 },
    { activityId: createdActivity[10].activityId, userId: 2 },
  ]);

  console.log("Creating entry services...");
  await EntryService.bulkCreate(entryServices);

  console.log("Creating rates...");
  await Rate.bulkCreate(rates);

  const openCount = caseSeeds.filter((c) => !c.isArchived).length;
  const archivedCount = caseSeeds.filter((c) => c.isArchived).length;
  const casesMissingTasks = caseSeeds.filter(
    (c) => !c.tasks || c.tasks.length === 0,
  ).length;

  console.log("Database reset and seeded successfully!");
  console.log(
    `Created ${createdUsers.length} users, ${createdCases.length} cases (${openCount} open, ${archivedCount} archived), ${createdPeople.length} people, and ${createdTasks.length} tasks`,
  );
  console.log(
    `Every case has at least one task: ${casesMissingTasks === 0 ? "yes" : `no (${casesMissingTasks} missing)`}`,
  );
});

await db.close();
