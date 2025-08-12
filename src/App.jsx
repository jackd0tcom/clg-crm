import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Home from "./Pages/Home.jsx";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import Landing from "./Pages/Landing.jsx";
import Writer from "./Elements/Writer.jsx";
import StoriesList from "./Elements/StoriesList.jsx";
import Nav from "./Elements/Nav.jsx";
import Restricted from "./Pages/Restricted.jsx";
import NewStory from "./Pages/NewStory.jsx";
import Profile from "./Pages/Profile.jsx";
import Reader from "./Elements/Reader.jsx";

function App() {
  const userId = useSelector((state) => state.userId);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get("/api/checkUser")
      .then((res) => dispatch({ type: "LOGIN", payload: res.data.userId }))
      .catch((err) => console.log(err));
  }, [userId]);
  return (
    <>
      <Nav />
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="/login"
          element={userId ? <Navigate to="/" /> : <Landing />}
        />
        <Route path="/new-story" element={<NewStory />} />
        <Route path="/write" element={<Writer />} />
        <Route path="/write/:storyId" element={<Writer />} />
        <Route path="/read/:storyId" element={<Reader />} />
        <Route path="/stories" element={<StoriesList />} />
        <Route path="/restricted" element={<Restricted />} />
        <Route
          path="/profile"
          element={!userId ? <Navigate to="/login" /> : <Profile />}
        />
        <Route path="/profile/:userIdParams" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
