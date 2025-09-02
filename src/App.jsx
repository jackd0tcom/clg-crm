import "./styles/App.css";
import { Route, Routes, Navigate } from "react-router";
import Home from "./Pages/Home.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import Landing from "./Pages/Landing.jsx";
import Nav from "./Elements/Nav.jsx";
import Profile from "./Pages/Profile.jsx";
import Case from "./Pages/Case.jsx";
import CaseList from "./Pages/CaseList.jsx";
import Tasks from "./Pages/Tasks.jsx";
import { formatDate } from "./helpers/helperFunctions.js";
import TaskView from "./Elements/TaskView.jsx";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const isAuthenticated = useSelector((state) => state.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get("/api/checkUser")
      .then((res) => dispatch({ type: "LOGIN", payload: res.data }))
      .catch((err) => console.log(err));
  }, [isAuthenticated]);

  const openTaskView = (id) => {
    setTaskId(id);
    setIsOpen(true);
  };

  const closeTaskView = () => {
    setIsOpen(false);
    setTaskId(null);
  };

  return (
    <>
      <div className="app-wrapper">
        <Nav />
        <div className="page-wrapper">
          <Routes>
            <Route index element={<Home />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Landing />}
            />
            <Route
              path="/case/:caseId"
              element={<Case openTaskView={openTaskView} />}
            />
            <Route
              path="/cases"
              element={
                !isAuthenticated ? <Navigate to="/login" /> : <CaseList />
              }
            />
            <Route
              path="/tasks"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <Tasks openTaskView={openTaskView} />
                )
              }
            />
            <Route
              path="/profile"
              element={
                !isAuthenticated ? <Navigate to="/login" /> : <Profile />
              }
            />
            <Route
              path="/profile/:userIdParams"
              element={
                !isAuthenticated ? <Navigate to="/login" /> : <Profile />
              }
            />
          </Routes>
        </div>
        {isOpen && (
          <TaskView taskId={taskId} isOpen={isOpen} onClose={closeTaskView} />
        )}
      </div>
    </>
  );
}

export default App;
