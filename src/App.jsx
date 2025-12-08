import "./styles/App.css";
import { Route, Routes, Navigate, useLocation } from "react-router";
import Home from "./Pages/Home.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import Nav from "./Elements/UI/Nav.jsx";
import Profile from "./Pages/Profile.jsx";
import Case from "./Pages/Case.jsx";
import CaseList from "./Pages/CaseList.jsx";
import Tasks from "./Pages/Tasks.jsx";
import TaskView from "./Elements/Task/TaskView.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "./Elements/UI/Loader.jsx";
import Auth0Sync from "./Elements/Auth/Auth0Sync.jsx";
import Calendar from "./Pages/Calendar.jsx";
import CalendarCallback from "./Pages/CalendarCallback.jsx";
import Settings from "./Pages/Settings.jsx";
import Inbox from "./Pages/Inbox.jsx";
import { addRecentItem } from "./helpers/recentItemsHelper";
import Admin from "./Pages/Admin.jsx";
import Denied from "./Pages/Denied.jsx";

function App() {
  const userStore = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userSynced, setUserSynced] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const [checkNotifications, setCheckNotifications] = useState(0);
  const [className, setClassName] = useState("app-wrapper");
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
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

  const handleSyncComplete = () => {
    setUserSynced(true);
  };

  const openTaskView = (taskOrId) => {
    // Handle both task object and task ID
    const taskId = typeof taskOrId === "object" ? taskOrId.taskId : taskOrId;

    // If we have the full task object, add it to recent items
    if (typeof taskOrId === "object" && taskOrId.taskId) {
      addRecentItem(taskOrId, "task");
    }

    setTaskId(taskId);
    setIsOpen(true);
  };

  const closeTaskView = () => {
    setIsOpen(false);
    setTaskId(null);
  };

  const handleTaskUpdate = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Only show Denied if: authenticated, synced, AND we have confirmed user data with isAllowed === false
  const shouldShowDenied =
    isAuthenticated &&
    userSynced &&
    userStore.userId !== null && // Ensure Redux store has been updated with user data
    userStore.isAllowed === false; // Explicit false check (not just falsy)

  return shouldShowDenied ? (
    <Denied />
  ) : (
    <>
      <Auth0Sync onSyncComplete={handleSyncComplete} />
      <div className={className}>
        {isAuthenticated && (
          <Nav
            checkNotifications={checkNotifications}
            userSynced={userSynced}
          />
        )}
        <div className="page-wrapper">
          {isLoading && !userSynced ? (
            <Loader />
          ) : (
            <Routes>
              <Route
                index
                element={
                  <Home
                    setClassName={setClassName}
                    openTaskView={openTaskView}
                    checkNotifications={checkNotifications}
                    setCheckNotifications={setCheckNotifications}
                    refreshKey={refreshKey}
                    userSynced={userSynced}
                  />
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <Home
                      checkNotifications={checkNotifications}
                      setCheckNotifications={setCheckNotifications}
                    />
                  )
                }
              />
              <Route
                path="/case/:caseId"
                element={
                  !isAuthenticated ? (
                    <Navigate to="/login" />
                  ) : (
                    <Case
                      openTaskView={openTaskView}
                      refreshKey={activePage === "case" ? refreshKey : 0}
                    />
                  )
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
              <Route
                path="/inbox"
                element={
                  !isAuthenticated ? (
                    <Navigate to="/login" />
                  ) : (
                    <Inbox
                      checkNotifications={checkNotifications}
                      setCheckNotifications={setCheckNotifications}
                      openTaskView={openTaskView}
                      refreshKey={activePage === "tasks" ? refreshKey : 0}
                    />
                  )
                }
              />
              <Route
                path="/calendar"
                element={
                  !isAuthenticated ? <Navigate to="/login" /> : <Calendar />
                }
              />
              <Route
                path="/settings"
                element={
                  !isAuthenticated ? <Navigate to="/login" /> : <Settings />
                }
              />
              <Route
                path="/admin"
                element={
                  !isAuthenticated || !userStore.isAdmin ? (
                    <Navigate to="/" />
                  ) : (
                    <Admin />
                  )
                }
              />
              <Route
                path="/google-calendar-callback"
                element={<CalendarCallback />}
              />
              <Route path="/calendar-callback" element={<CalendarCallback />} />
              <Route path="/denied" element={<Denied />} />
            </Routes>
          )}
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
