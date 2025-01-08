import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import authCtrl from "./controllers/authCtrl.js";
import storyCtrl from "./controllers/storyCtrl.js";
const { saveStory, getStory, getAllStories, deleteStory, newStory } = storyCtrl;
const { register, login, checkUser, logout, updateUser } = authCtrl;

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

// Endpoints here!
// auth endpoints
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/checkUser", checkUser);
app.delete("/api/logout", logout);
// app.put("/api/updateUser", updateUser);

app.post("/api/saveStory", saveStory);
app.post("/api/newStory", newStory);
app.post("/api/getStory", getStory);
app.get("/api/getAllStories", getAllStories);
app.delete("/api/deleteStory/:storyId", deleteStory);

ViteExpress.listen(app, PORT, () => console.log(`${PORT} chance baby`));
