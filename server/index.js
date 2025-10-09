import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import cors from "cors";
import path from "path";
import authCtrl from "./controllers/authCtrl.js";
import caseCtrl from "./controllers/caseCtrl.js";
import taskCtrl from "./controllers/taskCtrl.js";
import userCtrl from "./controllers/userCtrl.js";
import activityCtrl from "./controllers/activityCtrl.js";
import personCtrl from "./controllers/personCtrl.js";
import calendarCtrl from "./controllers/calendarCtrl.js";
import notificationsCtrl from "./controllers/notificationsCtrl.js";
import cleanupCtrl from "./controllers/cleanupCtrl.js";
import cleanupScheduler from "./services/cleanupScheduler.js";
import adminCtrl from "./controllers/adminCtrl.js";
import { requireAccess, requireAdmin } from "./middleware/authMiddleware.js";
import {
  setupSecurityMiddleware,
  sessionConfig,
  validateEnvironment,
  corsOptions,
  validationRules,
  handleValidationErrors,
  syncRateLimit,
} from "./config/security.js";

import dotenv from "dotenv";
dotenv.config();

// Validate environment variables
validateEnvironment();

const { updatePerson, newPerson, deletePerson } = personCtrl;
const { getUser, getUsers } = userCtrl;

const {
  getCases,
  saveCase,
  newCase,
  getCase,
  getCasesWithTasks,
  updateCasePhase,
  updateCasePriority,
  updateCaseNotes,
  addCaseAssignee,
  removeCaseAssignee,
  getCaseNonAssignees,
  updateCase,
  addCasePracticeArea,
  getPracticeAreas,
  removeCasePracticeArea,
  getLatestCase,
  archiveCase,
  newPracticeArea,
  removePracticeArea,
} = caseCtrl;
const {
  getAllTasks,
  getTasksByCase,
  newTask,
  saveTask,
  getTask,
  updateTaskStatus,
  getTaskNonAssignees,
  updateTask,
  addTaskAssignee,
  removeTaskAssignee,
  deleteTask,
  getTodayTasks,
} = taskCtrl;
const { register, login, checkUser, logout, syncAuth0User } = authCtrl;
const {
  getUserActivities,
  getCaseActivities,
  getTaskActivities,
  createActivity,
} = activityCtrl;
const {
  setupCalendar,
  getAuthUrl,
  handleCallback,
  checkConnection,
  getCalendarEvents,
  createTaskEvent,
  updateTaskEvent,
  deleteTaskEvent,
  getAppCalendar,
  getUserCalendars,
  getPreferredCalendar,
  updatePreferredCalendar,
  checkAppCalendars,
  disconnectCalendar,
  syncAllTasks,
} = calendarCtrl;
const {
  getNotifications,
  markAsRead,
  markAsCleared,
  getUnreadCount,
  markAllAsRead,
} = notificationsCtrl;

// Express setup
const app = express();
const PORT = process.env.PORT || 5050;

// Setup security middleware (includes body parsing, CORS, rate limiting, etc.)
if (process.env.NODE_ENV === "production") {
  setupSecurityMiddleware(app);
} else {
  // Development: minimal middleware setup
  console.log("🔧 Development mode: Minimal security middleware");

  // Basic middleware only
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // CORS for development
  app.use(
    cors({
      origin: true, // Allow all origins in development
      credentials: true,
    })
  );

  // Rate limiting for sync endpoint (even in development)
  app.use("/api/sync-auth0-user", syncRateLimit);

  // Explicitly remove any security headers
  app.use((req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("X-Content-Type-Options");
    res.removeHeader("X-Frame-Options");
    res.removeHeader("X-XSS-Protection");
    res.removeHeader("Referrer-Policy");
    res.removeHeader("Strict-Transport-Security");
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.removeHeader("Cross-Origin-Resource-Policy");
    next();
  });
}

// Session configuration
app.use(session(sessionConfig));

// Final CSP removal middleware (runs after all other middleware)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    // Log headers for debugging

    // Force remove CSP headers after all middleware has run
    res.on("header", () => {
      res.removeHeader("Content-Security-Policy");
      res.removeHeader("X-Content-Type-Options");
      res.removeHeader("X-Frame-Options");
      res.removeHeader("X-XSS-Protection");
      res.removeHeader("Referrer-Policy");
      res.removeHeader("Strict-Transport-Security");
      res.removeHeader("Cross-Origin-Opener-Policy");
      res.removeHeader("Cross-Origin-Embedder-Policy");
      res.removeHeader("Cross-Origin-Resource-Policy");
    });
    next();
  });
}

// Endpoints
// auth endpoints
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/checkUser", checkUser);
app.delete("/api/logout", logout);
// app.put("/api/updateUser", updateUser);
app.post("/api/sync-auth0-user", syncAuth0User);

// user endpoints
app.get("/api/getUser/:userId", getUser);
app.get("/api/getUsers", getUsers);
app.delete("/api/deletePerson", deletePerson);

// case endpoints
app.get("/api/getCases", getCases);
app.get("/api/getCasesWithTasks", getCasesWithTasks);
app.get("/api/getCase/:caseId", getCase);
app.post("/api/newCase", newCase);
app.post("/api/saveCase", saveCase);
app.post("/api/updateCase", updateCase);
app.post("/api/updateCasePhase", updateCasePhase);
app.post("/api/updateCasePriority", updateCasePriority);
app.post("/api/updateCaseNotes", updateCaseNotes);
app.post("/api/addCaseAssignees", addCaseAssignee);
app.delete("/api/removeCaseAssignees", removeCaseAssignee);
app.get("/api/getCaseNonAssignees/:caseId", getCaseNonAssignees);
app.get("/api/archiveCase/:caseId", archiveCase);
app.post("/api/addCasePracticeArea", addCasePracticeArea);
app.post("/api/removeCasePracticeArea", removeCasePracticeArea);
app.get("/api/getPracticeAreas", getPracticeAreas);
app.get("/api/getLatestCase", getLatestCase);
app.post("/api/newPracticeArea", newPracticeArea);
app.delete("/api/removePracticeArea", removePracticeArea);

// Person endpoints
app.post("/api/updatePerson", updatePerson);
app.post("/api/newPerson", newPerson);

// task endpoints
app.get("/api/getAllTasks", getAllTasks);
app.get("/api/getTodayTasks", getTodayTasks);
app.get("/api/getTasksByCase/:caseId", getTasksByCase);
app.post("/api/newTask", newTask);
app.post("/api/saveTask", saveTask);
app.post("/api/updateTask", updateTask);
app.post("/api/updateTaskStatus", updateTaskStatus);
app.get("/api/getTask/:taskId", getTask);
app.get("/api/getTaskNonAssignees/:taskId", getTaskNonAssignees);
app.post("/api/addTaskAssignees", addTaskAssignee);
app.delete("/api/removeTaskAssignees", removeTaskAssignee);
app.delete("/api/deleteTask", deleteTask);

// activity endpoints
app.get("/api/getUserActivities", getUserActivities);
app.get("/api/getCaseActivities/:caseId", getCaseActivities);
app.get("/api/getTaskActivities/:taskId", getTaskActivities);
app.post("/api/createActivity", createActivity);
app.post("/api/markAsRead", markAsRead);

// calendar endpoints
app.post("/api/calendar/setup", setupCalendar);
app.get("/api/calendar/auth-url", getAuthUrl);
app.post("/api/calendar/callback", handleCallback);
app.get("/api/calendar/events", getCalendarEvents);
app.get("/api/calendar/check-connection", checkConnection);
app.get("/api/calendar/app-calendar", getAppCalendar);
app.get("/api/calendar/user-calendars", getUserCalendars);
app.get("/api/calendar/check-app-calendars", checkAppCalendars);
app.get("/api/calendar/preferred-calendar", getPreferredCalendar);
app.post("/api/calendar/preferred-calendar", updatePreferredCalendar);
app.post("/api/calendar/create-task-event", createTaskEvent);
app.post("/api/calendar/update-task-event", updateTaskEvent);
app.post("/api/calendar/delete-task-event", deleteTaskEvent);
app.post("/api/calendar/disconnect", disconnectCalendar);
app.post("/api/calendar/sync-tasks", syncAllTasks);

// notification endpoints
app.get("/api/notifications", getNotifications);
app.post("/api/notifications/mark-read", markAsRead);
app.post("/api/notifications/mark-clear", markAsCleared);
app.get("/api/notifications/unread-count", getUnreadCount);
app.post("/api/notifications/mark-all-read", markAllAsRead);

// user access check endpoint
app.get("/api/user/check-access", adminCtrl.checkUserAccess);

// admin endpoints (require admin role)
app.get("/api/admin/users", requireAccess, requireAdmin, adminCtrl.getAllUsers);
app.post(
  "/api/admin/users/:userId/access",
  requireAccess,
  requireAdmin,
  adminCtrl.updateUserAccess
);
app.post(
  "/api/admin/users/:userId/role",
  requireAccess,
  requireAdmin,
  adminCtrl.updateUserRole
);
app.post(
  "/api/admin/users",
  requireAccess,
  requireAdmin,
  adminCtrl.addUserByEmail
);
app.post(
  "/api/admin/users/bulk-access",
  requireAccess,
  requireAdmin,
  adminCtrl.bulkUpdateUserAccess
);

// cleanup endpoints (admin only)
app.get("/api/cleanup/stats", cleanupCtrl.getDatabaseStats);
app.get("/api/cleanup/policies", cleanupCtrl.getCleanupPolicies);
app.get("/api/cleanup/status", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  res.json(cleanupScheduler.getStatus());
});
app.post("/api/cleanup/activity-logs", cleanupCtrl.cleanupActivityLogs);
app.post("/api/cleanup/notifications", cleanupCtrl.cleanupNotifications);
app.post("/api/cleanup/comments", cleanupCtrl.cleanupComments);
app.post("/api/cleanup/completed-tasks", cleanupCtrl.cleanupCompletedTasks);
app.post("/api/cleanup/archived-cases", cleanupCtrl.cleanupArchivedCases);
app.post("/api/cleanup/full", cleanupCtrl.runFullCleanup);

ViteExpress.listen(
  app,
  PORT,
  () => {
    console.log(
      `live on http://localhost:${PORT} ${
        process.env.NODE_ENV === "production" ? "production" : "development"
      }`
    );

    // Start automated cleanup scheduler
    cleanupScheduler.start();
  },
  {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
  }
);
