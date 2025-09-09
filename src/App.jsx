import "./styles/App.css";
import { Route, Routes, Navigate, useLocation } from "react-router";
import Home from "./Pages/Home.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
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
  const [activePage, setActivePage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isAuthenticated = useSelector((state) => state.isAuthenticated);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/api/checkUser")
      .then((res) => dispatch({ type: "LOGIN", payload: res.data }))
      .catch((err) => console.log(err));
  }, [isAuthenticated]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/case/") && path !== "/case/0") {
      setActivePage("case");
    } else if (path === "/cases") {
      setActivePage("caseList");
    } else if (path === "/tasks" || path.startsWith("/tasks/")) {
      setActivePage("tasks");
    } else {
      setActivePage(null);
    }
  }, [location.pathname]);

  const openTaskView = (id) => {
    setTaskId(id);
    setIsOpen(true);
  };

  const closeTaskView = () => {
    setIsOpen(false);
    setTaskId(null);
  };

  const handleTaskUpdate = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

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
              element={
                <Case
                  openTaskView={openTaskView}
                  refreshKey={activePage === "case" ? refreshKey : 0}
                />
              }
            />
            <Route
              path="/cases"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <CaseList
                    openTaskView={openTaskView}
                    refreshKey={activePage === "caseList" ? refreshKey : 0}
                  />
                )
              }
            />
            <Route
              path="/tasks"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <Tasks
                    openTaskView={openTaskView}
                    refreshKey={activePage === "tasks" ? refreshKey : 0}
                  />
                )
              }
            />
            <Route
              path="/tasks/:caseId"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <Tasks
                    openTaskView={openTaskView}
                    refreshKey={activePage === "tasks" ? refreshKey : 0}
                  />
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
          <TaskView
            taskId={taskId}
            setTaskId={setTaskId}
            isOpen={isOpen}
            onClose={closeTaskView}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </>
  );
}

export default App;
