import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import authCtrl from "./controllers/authCtrl.js";
import caseCtrl from "./controllers/caseCtrl.js";
import taskCtrl from "./controllers/taskCtrl.js";
import userCtrl from "./controllers/userCtrl.js";
import activityCtrl from "./controllers/activityCtrl.js";
import personCtrl from "./controllers/personCtrl.js";
import calendarCtrl from "./controllers/calendarCtrl.js";
import notificationsCtrl from "./controllers/notificationsCtrl.js";

import dotenv from "dotenv";
dotenv.config();

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
} = taskCtrl;
const { register, login, checkUser, logout, syncAuth0User } = authCtrl;
const {
  getUserActivities,
  getCaseActivities,
  getTaskActivities,
  createActivity,
  markAsRead,
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
} = calendarCtrl;

const { getNotifications } = notificationsCtrl;

// Express setup
const app = express();
const PORT = 5050;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "bigtime",
    cookie: {
      maxAge: 1000 * 60 * 60 * 48,
    },
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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

// Person endpoints
app.post("/api/updatePerson", updatePerson);
app.post("/api/newPerson", newPerson);

// task endpoints
app.get("/api/getAllTasks", getAllTasks);
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

ViteExpress.listen(app, PORT, () =>
  console.log(`http://localhost:${PORT} chance baby`)
);

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

// Notifications endpoints
app.get("/api/getNotifications", getNotifications);
