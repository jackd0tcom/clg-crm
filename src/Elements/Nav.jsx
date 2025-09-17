import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { NavLink } from "react-router";
import ProfilePic from "./ProfilePic";
import { useAuth0 } from "@auth0/auth0-react";

const Nav = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useAuth0();
  const navigate = useNavigate();

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
                  src="/src/assets/Clause-Law-Group-Logo-White.webp"
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
                <i className="fa-solid fa-inbox"></i>
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
                <i className="fa-solid fa-suitcase"></i>
                Cases
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-regular fa-calendar"></i>
                Calendar
              </NavLink>
            </div>
            <div className="nav-buttons-container">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <i className="fa-solid fa-gear"></i>
                Settings
              </NavLink>
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
