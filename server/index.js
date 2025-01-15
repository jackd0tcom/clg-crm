import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import authCtrl from "./controllers/authCtrl.js";
import storyCtrl from "./controllers/storyCtrl.js";
import userCtrl from "./controllers/userCtrl.js";
const { getUser, getFriends } = userCtrl;
const {
  saveStory,
  getStory,
  getAllStories,
  deleteStory,
  newStory,
  getAllFriendStories,
  getTopStories,
  publishStory,
} = storyCtrl;
const { register, login, checkUser, logout, updateUser } = authCtrl;

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
app.get("/api/getFriends", getFriends);

app.post("/api/saveStory", saveStory);
app.post("/api/newStory", newStory);
app.post("/api/getStory", getStory);
app.get("/api/getAllStories", getAllStories);
app.delete("/api/deleteStory/:storyId", deleteStory);
app.get("/api/getFriendStories", getAllFriendStories);
app.get("/api/getTopStories", getTopStories);
app.post("/api/publishStory", publishStory);

ViteExpress.listen(app, PORT, () => console.log(`${PORT} chance baby`));
