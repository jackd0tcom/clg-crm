import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { capitalize } from "../helpers/helperFunctions";
import CaseListItem from "../Elements/CaseList/CaseListItem";
import axios from "axios";
import Loader from "../Elements/UI/Loader";
import { useAuth0 } from "@auth0/auth0-react";
import ToDoWidget from "../Elements/Home/ToDoWidget";
import UpdatesWidget from "../Elements/Home/UpdatesWidget";
import RecentItemsWidget from "../Elements/Home/RecentItemsWidget";
import { formatDateWithDay } from "../helpers/helperFunctions";
import LoginButton from "../Elements/Auth/LoginButton";
import CasesWidget from "../Elements/Home/CasesWidget";
import { Link } from "react-router-dom";

const Home = ({
  openTaskView,
  checkNotifications,
  setCheckNotifications,
  refreshKey,
  userSynced,
  setClassName,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const date = new Date();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setClassName("home-wrapper");
    }
  }, [isLoading]);

  return !isAuthenticated ? (
    <section className="home-landing-section">
      <video loop={true} muted autoPlay={true} playsInline className="bg-video">
        <source src="https://videos.files.wordpress.com/8jJQp5hK/stock-video-example.mp4" />
      </video>
      <div className="bg-video-overlay">
        <div className="home-content">
          <a href="https://clauselawgroup.com" target="_blank">
            <img
              className="welcome-logo"
              src="Clause-Law-Group-Logo-Green.png"
              alt=""
            />
          </a>
          <div className="welcome-content">
            <h1 className="welcome-heading">Welcome Back</h1>
            <h3>Sign in below with your Google account to continue</h3>
            <LoginButton />
            <p>New here? Contact your administrator to set up an account.</p>
          </div>
        </div>
      </div>
    </section>
  ) : isLoading ? (
    <Loader />
  ) : (
    <div className="home-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>{formatDateWithDay(date)}</p>
      </div>
      <div className="widget-wrapper">
        <RecentItemsWidget
          openTaskView={openTaskView}
          navigate={navigate}
          refreshTrigger={refreshKey}
          userSynced={userSynced}
        />
        <UpdatesWidget
          openTaskView={openTaskView}
          checkNotifications={checkNotifications}
          setCheckNotifications={setCheckNotifications}
          userSynced={userSynced}
        />
        <ToDoWidget openTaskView={openTaskView} userSynced={userSynced} refreshKey={refreshKey} />
        <CasesWidget
          loading={loading}
          setLoading={setLoading}
          userSynced={userSynced}
        />
      </div>
    </div>
  );
};

export default Home;
