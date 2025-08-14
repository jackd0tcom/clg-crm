import connectToDB from "./db.js";
import {
  User,
  Task,
  Case,
  Comment,
  ActivityLog,
  Notification,
  CaseAssignees,
  TaskAssignees,
  ActivityReaders,
} from "./model.js";
import bcrypt from "bcryptjs";

const db = await connectToDB("postgresql:///clg-db");

const users = [
  {
    username: "admin",
    password: bcrypt.hashSync("1234", 10),
    firstName: "Jack",
    lastName: "Ball",
    role: "admin",
  },
  {
    username: "meg_attorney",
    password: bcrypt.hashSync("meg456", 10),
    firstName: "Meg",
    lastName: "Williams",
    role: "team_member",
  },
  {
    username: "jenn_paralegal",
    password: bcrypt.hashSync("jenn789", 10),
    firstName: "Jenn",
    lastName: "Davis",
    role: "team_member",
  },
  {
    username: "mike_partner",
    password: bcrypt.hashSync("mike321", 10),
    firstName: "Mike",
    lastName: "Thompson",
    role: "admin",
  },
  {
    username: "lisa_associate",
    password: bcrypt.hashSync("lisa654", 10),
    firstName: "Lisa",
    lastName: "Rodriguez",
    role: "team_member",
  },
];

// Create cases
const cases = [
  {
    ownerId: 1, // Sarah Johnson
    title: "Smith Divorce Settlement",
    clientName: "John & Mary Smith",
    notes:
      "High-conflict divorce case, assets include family business and real estate holdings",
    practiceArea: "divorce",
    phase: "negotiation",
    priority: "high",
    status: "in progress",
  },
  {
    ownerId: 2, // Meg Williams
    title: "Downtown Real Estate Development",
    clientName: "Urban Development Corp",
    notes: "Zoning issues for mixed-use development project",
    practiceArea: "real estate",
    phase: "litigation",
    priority: "urgent",
    status: "in progress",
  },
  {
    ownerId: 3, // Jenn Davis
    title: "Custody Battle - Johnson Family",
    clientName: "Amanda Johnson",
    notes: "Custody dispute involving relocation and school district changes",
    practiceArea: "custody",
    phase: "investigation",
    priority: "normal",
    status: "in progress",
  },
  {
    ownerId: 4, // Mike Thompson
    title: "Personal Injury - Car Accident",
    clientName: "Robert Chen",
    notes:
      "Multi-vehicle accident with severe injuries, insurance company dispute",
    practiceArea: "personal injury",
    phase: "settlement",
    priority: "high",
    status: "in progress",
  },
  {
    ownerId: 1, // Sarah Johnson
    title: "Corporate Merger - TechStart Inc",
    clientName: "TechStart Inc",
    notes: "Merger with competitor, due diligence and contract negotiations",
    practiceArea: "corporate",
    phase: "negotiation",
    priority: "normal",
    status: "not started",
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
    taskId: 1,
    content:
      "Financial documents received from client. Need to verify authenticity of business valuations.",
    isInternal: true,
  },
  {
    authorId: 2, // Meg Williams
    taskId: 1,
    content:
      "I'll review the business valuation reports tomorrow. Sarah, can you forward the tax returns?",
    isInternal: true,
  },
  {
    authorId: 3, // Jenn Davis
    caseId: 3,
    content:
      "Client mentioned concerns about child's relationship with father. Need to document this for custody evaluation.",
    isInternal: true,
  },
  {
    authorId: 4, // Mike Thompson
    taskId: 4,
    content:
      "Insurance company offered $50K settlement. Client wants to counter with $150K based on medical bills and lost wages.",
    isInternal: true,
  },
  {
    authorId: 5, // Lisa Rodriguez
    caseId: 2,
    content:
      "Zoning board meeting scheduled for next Thursday. Need to prepare presentation materials.",
    isInternal: true,
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
    type: "task_assigned",
    message: "You have been assigned to: File motion for summary judgment",
    isRead: false,
    relatedId: 2,
    relatedType: "task",
  },
  {
    userId: 3, // Jenn Davis
    type: "task_overdue",
    message: "Task 'Interview child's teacher and counselor' is due in 2 days",
    isRead: false,
    relatedId: 3,
    relatedType: "task",
  },
  {
    userId: 1, // Sarah Johnson
    type: "case_update",
    message: "Case 'Smith Divorce Settlement' has new activity",
    isRead: false,
    relatedId: 1,
    relatedType: "case",
  },
  {
    userId: 4, // Mike Thompson
    type: "comment",
    message: "New comment on task: Negotiate with insurance adjuster",
    isRead: false,
    relatedId: 4,
    relatedType: "task",
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
await db.sync({ force: true }).then(async () => {
  console.log("Creating users...");
  const createdUsers = await User.bulkCreate(users);

  console.log("Creating cases...");
  const createdCases = await Case.bulkCreate(cases);

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
    `Created ${createdUsers.length} users, ${createdCases.length} cases, and ${createdTasks.length} tasks`
  );
  console.log(
    `Created ${caseAssignments.length} case assignments, ${taskAssignments.length} task assignments, and ${activityReaders.length} activity readers`
  );
});

await db.close();
