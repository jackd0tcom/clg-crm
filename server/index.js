import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import authCtrl from "./controllers/authCtrl.js";
import caseCtrl from "./controllers/caseCtrl.js";
import taskCtrl from "./controllers/taskCtrl.js";
import userCtrl from "./controllers/userCtrl.js";
import activityCtrl from "./controllers/activityCtrl.js";
import personCtrl from "./controllers/personCtrl.js";
const { updatePerson } = personCtrl;
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
} = caseCtrl;
const {
  getAllTasks,
  getTasksByCase,
  newTask,
  saveTask,
  getTask,
  updateTaskStatus,
} = taskCtrl;
const { register, login, checkUser, logout, updateUser } = authCtrl;
const { getUserActivities, getCaseActivities, createActivity, markAsRead } =
  activityCtrl;

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

// user endpoints
app.get("/api/getUser/:userId", getUser);
app.get("/api/getUsers", getUsers);

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
app.post("/api/addCasePracticeArea", addCasePracticeArea);
app.post("/api/removeCasePracticeArea", removeCasePracticeArea);
app.get("/api/getPracticeAreas", getPracticeAreas);

// Person endpoints
app.post("/api/updatePerson", updatePerson);

// task endpoints
app.get("/api/getAllTasks", getAllTasks);
app.get("/api/getTasksByCase/:caseId", getTasksByCase);
app.post("/api/newTask", newTask);
app.post("/api/saveTask", saveTask);
app.post("/api/updateTaskStatus", updateTaskStatus);
app.get("/api/getTask", getTask);

// activity endpoints
app.get("/api/getUserActivities", getUserActivities);
app.get("/api/getCaseActivities/:caseId", getCaseActivities);
app.post("/api/createActivity", createActivity);
app.post("/api/markAsRead", markAsRead);

ViteExpress.listen(app, PORT, () =>
  console.log(`http://localhost:${PORT} chance baby`)
);
