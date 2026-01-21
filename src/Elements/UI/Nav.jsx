import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { NavLink } from "react-router";
import ProfilePic from "./ProfilePic";
import { useAuth0 } from "@auth0/auth0-react";

const Nav = ({ checkNotifications, userSynced }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { isAuthenticated } = useAuth0();
  const [notification, setNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userSynced) return;

    const fetch = async () => {
      try {
        const res = await axios.get("/api/notifications");
        let unread = [];
        unread = res.data.filter((item) => !item.isCleared && !item.isRead);
        setNotification(unread.length >= 1);
      } catch (error) {
        console.log(error);
        setNotification(false);
      }
    };
    fetch();
  }, [checkNotifications, userSynced]);

  return (
    <nav className="nav-bar">
      <div className="nav-buttons-wrapper">
        {!isAuthenticated ? (
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            Log In
          </button>
        ) : (
          <>
            <div className="nav-buttons-container">
              <img
                className="clg-logo"
                src="/Clause-Law-Group-Logo-White.webp"
                alt="clg-logo"
              />
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-grip"></i>
                Dashboard
              </NavLink>
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <span className="notification-icon-wrapper">
                  <i className="fa-solid fa-inbox"></i>
                  {notification && (
                    <i className="fa-solid fa-circle notification-push"></i>
                  )}
                </span>
                Inbox
              </NavLink>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-list-check"></i>
                Tasks
              </NavLink>
              <NavLink
                to="/cases"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-briefcase"></i>
                Cases
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-calendar-days"></i>
                Calendar
              </NavLink>
              <NavLink
                to="/time-keeper"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-clock"></i>
                Time Keeper
              </NavLink>
            </div>
            <div className="nav-buttons-container profile-buttons">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-gear"></i>
                Settings
              </NavLink>
              {user.isAdmin && isAuthenticated && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive
                      ? "active-nav nav-button"
                      : "inactive-nav nav-button"
                  }
                >
                  <i className="fa-solid fa-user-tie"></i>
                  Admin
                </NavLink>
              )}
              {/* <NavLink
                to="/search"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                Search
              </NavLink> */}
              <NavLink
                id="nav-profile"
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <ProfilePic />
                Profile
              </NavLink>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
