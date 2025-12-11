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
  process.env.DATABASE_URL || "postgresql:///clg-db"
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

// Create cases
const cases = [
  {
    ownerId: 1, // Sarah Johnson
    title: "Smith Divorce Settlement",
    notes:
      "High-conflict divorce case, assets include family business and real estate holdings",
    phase: "negotiation",
  },
  {
    ownerId: 2, // Meg Williams
    title: "Downtown Real Estate Development",
    notes: "Zoning issues for mixed-use development project",
    phase: "litigation",
  },
  {
    ownerId: 3, // Jenn Davis
    title: "Custody Battle - Johnson Family",
    notes: "Custody dispute involving relocation and school district changes",
    phase: "investigation",
  },
  {
    ownerId: 4, // Mike Thompson
    title: "Personal Injury - Car Accident",
    notes:
      "Multi-vehicle accident with severe injuries, insurance company dispute",
    phase: "settlement",
  },
  {
    ownerId: 1, // Sarah Johnson
    title: "Corporate Merger - TechStart Inc",
    notes: "Merger with competitor, due diligence and contract negotiations",
    phase: "negotiation",
  },
  {
    ownerId: 1, // Sarah Johnson
    title: "Corporate Merger - TechStart Inc",
    notes: "Merger with competitor, due diligence and contract negotiations",
    phase: "negotiation",
  },
];

// Create people involved in cases
const people = [
  {
    caseId: 1, // Smith Divorce Settlement
    firstName: "John",
    lastName: "Smith",
    address: "123 Oak Street",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    phoneNumber: "2175550101",
    dob: "1980-03-15",
    county: "Sangamon",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 1, // Smith Divorce Settlement
    firstName: "Mary",
    lastName: "Smith",
    address: "456 Maple Avenue",
    city: "Springfield",
    state: "IL",
    zip: "62702",
    phoneNumber: "2175550102",
    dob: "1982-07-22",
    county: "Sangamon",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 2, // Downtown Real Estate Development
    firstName: "Robert",
    lastName: "Chen",
    address: "789 Business Blvd",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    phoneNumber: "3125550201",
    dob: "1975-11-08",
    county: "Cook",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 3, // Custody Battle - Johnson Family
    firstName: "Amanda",
    lastName: "Johnson",
    address: "321 Family Circle",
    city: "Peoria",
    state: "IL",
    zip: "61601",
    phoneNumber: "3095550301",
    dob: "1988-05-14",
    county: "Peoria",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 3, // Custody Battle - Johnson Family
    firstName: "Michael",
    lastName: "Johnson",
    address: "654 Parent Lane",
    city: "Peoria",
    state: "IL",
    zip: "61602",
    phoneNumber: "3095550302",
    dob: "1986-09-30",
    county: "Peoria",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 4, // Personal Injury - Car Accident
    firstName: "Robert",
    lastName: "Chen",
    address: "987 Hospital Drive",
    city: "Rockford",
    state: "IL",
    zip: "61101",
    phoneNumber: "8155550401",
    dob: "1990-12-03",
    county: "Winnebago",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 5, // Corporate Merger - TechStart Inc
    firstName: "Sarah",
    lastName: "Williams",
    address: "555 Corporate Plaza",
    city: "Chicago",
    state: "IL",
    zip: "60602",
    phoneNumber: "3125550501",
    dob: "1972-04-18",
    county: "Cook",
    SSN: 123456,
    type: "client",
  },
  {
    caseId: 5, // Corporate Merger - TechStart Inc
    firstName: "David",
    lastName: "Rodriguez",
    address: "777 Tech Tower",
    city: "Chicago",
    state: "IL",
    zip: "60603",
    phoneNumber: "3125550502",
    dob: "1968-08-25",
    county: "Cook",
    SSN: 123456,
    type: "client",
  },
];

// Create tasks
const tasks = [
  {
    ownerId: 1, // Sarah Johnson
    title: "Review financial disclosure documents",
    notes:
      "Need to analyze Smith family business financials for equitable distribution",
    caseId: 1,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    priority: "high",
    status: "in progress",
  },
  {
    ownerId: 2, // Meg Williams
    title: "File motion for summary judgment",
    notes: "Prepare and file motion based on recent zoning ordinance changes",
    caseId: 2,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    priority: "urgent",
    status: "not started",
  },
  {
    ownerId: 3, // Jenn Davis
    title: "Interview child's teacher and counselor",
    notes: "Gather information about child's academic and emotional well-being",
    caseId: 3,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    priority: "normal",
    status: "not started",
  },
  {
    ownerId: 4, // Mike Thompson
    title: "Negotiate with insurance adjuster",
    notes: "Discuss settlement offer and medical expenses coverage",
    caseId: 4,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    priority: "high",
    status: "in progress",
  },
  {
    ownerId: 1, // Sarah Johnson
    title: "Prepare merger agreement draft",
    notes: "Initial draft of merger terms and conditions",
    caseId: 5,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: "normal",
    status: "not started",
  },
  {
    ownerId: 2, // Meg Williams
    title: "Research recent zoning precedents",
    notes: "Find similar cases that support our development proposal",
    caseId: 2,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    priority: "normal",
    status: "in progress",
  },
];

// Create comments
const comments = [
  {
    authorId: 1, // Sarah Johnson
    objectType: "task",
    objectId: 1,
    content:
      "Financial documents received from client. Need to verify authenticity of business valuations.",
  },
  {
    authorId: 2, // Meg Williams
    objectType: "task",
    objectId: 1,
    content:
      "I'll review the business valuation reports tomorrow. Sarah, can you forward the tax returns?",
  },
  {
    authorId: 3, // Jenn Davis
    objectType: "case",
    objectId: 3,
    content:
      "Client mentioned concerns about child's relationship with father. Need to document this for custody evaluation.",
  },
  {
    authorId: 4, // Mike Thompson
    objectType: "task",
    objectId: 4,
    content:
      "Insurance company offered $50K settlement. Client wants to counter with $150K based on medical bills and lost wages.",
  },
  {
    authorId: 5, // Lisa Rodriguez
    objectType: "case",
    objectId: 2,
    content:
      "Zoning board meeting scheduled for next Thursday. Need to prepare presentation materials.",
  },
];

// Create activity logs
const activityLogs = [
  {
    authorId: 1, // Sarah Johnson
    objectType: "task",
    objectId: 1,
    action: "task_created",
    details: "Created task: Review financial disclosure documents",
  },
  {
    authorId: 2, // Meg Williams
    objectType: "task",
    objectId: 1,
    action: "status_updated",
    details: "Updated task status to 'in progress'",
  },
  {
    authorId: 3, // Jenn Davis
    objectType: "case",
    objectId: 3,
    action: "case_assigned",
    details: "Assigned custody case to Jenn Davis",
  },
  {
    authorId: 3, // Jenn Davis
    objectType: "case",
    objectId: 1,
    action: "phase_updated",
    details: "changed case phase to negotiation",
  },
  {
    authorId: 2,
    objectType: "case",
    objectId: 1,
    action: "phase_updated",
    details: "changed case phase to litigation",
  },
  {
    authorId: 1,
    objectType: "case",
    objectId: 1,
    action: "priority_update",
    details: "changed case priority to high",
  },
  {
    authorId: 3, // Jenn Davis
    objectType: "case",
    objectId: 1,
    action: "case_created",
    details: "Case opened by George Clause",
  },
  {
    authorId: 4, // Mike Thompson
    objectType: "task",
    objectId: 4,
    action: "priority_changed",
    details: "Changed task priority from 'normal' to 'high'",
  },
  {
    authorId: 5, // Lisa Rodriguez
    objectType: "case",
    objectId: 2,
    action: "comment_added",
    details: "Added comment about zoning board meeting",
  },
];

// Create notifications
const notifications = [
  {
    userId: 2, // Meg Williams
    type: "assignment",
    objectType: "task",
    objectId: 2,
    message: "You have been assigned to: File motion for summary judgment",
    isRead: false,
  },
  {
    userId: 3, // Jenn Davis
    type: "due_date",
    objectType: "task",
    objectId: 3,
    message: "Task 'Interview child's teacher and counselor' is due in 2 days",
    isRead: false,
  },
  {
    userId: 1, // Sarah Johnson
    type: "status_change",
    objectType: "case",
    objectId: 1,
    message: "Case 'Smith Divorce Settlement' has new activity",
    isRead: false,
  },
  {
    userId: 4, // Mike Thompson
    type: "comment",
    objectType: "task",
    objectId: 4,
    message: "New comment on task: Negotiate with insurance adjuster",
    isRead: false,
  },
];

// Create activity readers (many-to-many relationships)
const activityReaders = [
  // Activity 1: Task created - both Meg and Jenn should see it (they're assigned to the case)
  { activityId: 1, userId: 2 }, // Meg Williams
  { activityId: 1, userId: 3 }, // Jenn Davis

  // Activity 2: Status updated - Sarah (task owner) should see it
  { activityId: 2, userId: 1 }, // Sarah Johnson

  // Activity 3: Case assigned - Jack (case owner) and Mike (partner) should see it
  { activityId: 3, userId: 1 }, // Jack
  { activityId: 3, userId: 4 }, // Mike Thompson

  // Activity 4: Priority changed - Sarah (task owner) should see it
  { activityId: 4, userId: 1 }, // Sarah Johnson

  // Activity 5: Comment added - Meg (case owner) should see it
  { activityId: 5, userId: 2 }, // Meg Williams
];

// Create case assignments (many-to-many relationships)
const caseAssignments = [
  { caseId: 1, userId: 2 },
  { caseId: 1, userId: 3 },
  { caseId: 2, userId: 5 },
  { caseId: 3, userId: 1 },
  { caseId: 4, userId: 2 },
  { caseId: 5, userId: 3 },
];

// Create task assignments (many-to-many relationships)
const taskAssignments = [
  { taskId: 1, userId: 2 },
  { taskId: 1, userId: 3 },
  { taskId: 2, userId: 5 },
  { taskId: 3, userId: 1 },
  { taskId: 4, userId: 2 },
  { taskId: 6, userId: 3 },
];

// Sync database and seed data
await db.sync({ alter: true }).then(async () => {
  console.log("Creating users...");
  const createdUsers = await User.bulkCreate(users);

  console.log("Creating cases...");
  const createdCases = await Case.bulkCreate(cases);

  console.log("Creating case-practice area relationships...");
  const casePracticeAreaRelations = [
    { caseId: 1, practiceAreaId: 1 }, // Case 1: divorce
    { caseId: 1, practiceAreaId: 2 }, // Case 1: custody (multiple areas)
    { caseId: 2, practiceAreaId: 6 }, // Case 2: real estate - buyer
    { caseId: 3, practiceAreaId: 2 }, // Case 3: custody
    { caseId: 4, practiceAreaId: 9 }, // Case 4: personal injury - MVA
    { caseId: 5, practiceAreaId: 14 }, // Case 5: estate planning
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
    `Created ${createdUsers.length} users, ${createdCases.length} cases, ${createdPeople.length} people, and ${createdTasks.length} tasks`
  );
  console.log(
    `Created ${caseAssignments.length} case assignments, ${taskAssignments.length} task assignments, and ${activityReaders.length} activity readers`
  );
});

await db.close();
