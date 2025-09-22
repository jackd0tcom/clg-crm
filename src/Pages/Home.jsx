import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { capitalize } from "../helpers/helperFunctions";
import CaseListItem from "../Elements/CaseListItem";
import axios from "axios";
import Loader from "../Elements/Loader";
import { useAuth0 } from "@auth0/auth0-react";
import ToDoWidget from "../Elements/ToDoWidget";
import UpdatesWidget from "../Elements/UpdatesWidget";
import RecentItemsWidget from "../Elements/RecentItemsWidget";
import { formatDateNoTime } from "../helpers/helperFunctions";
import LoginButton from "../Elements/LoginButton";
import CasesWidget from "../Elements/CasesWidget";

const Home = ({ openTaskView }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const date = new Date();

  return !isAuthenticated ? (
    <section className="home-landing-section">
      <video loop={true} muted autoPlay={true} playsInline className="bg-video">
        <source src="https://videos.files.wordpress.com/8jJQp5hK/stock-video-example.mp4" />
      </video>
      <div className="bg-video-overlay">
        <div className="home-content">
          <img
            className="welcome-logo"
            src="src/assets/Clause-Law-Group-Logo-Green.png"
            alt=""
          />
          <h1>Welcome Back!</h1>
          <LoginButton />
          <p>New here? Contact your administrator to set up an account.</p>
        </div>
      </div>
    </section>
  ) : isLoading ? (
    <Loader />
  ) : (
    <div className="home-container">
      <p>{formatDateNoTime(date)}</p>
      <h1>Dashboard</h1>
      <div className="widget-wrapper">
        <RecentItemsWidget openTaskView={openTaskView} navigate={navigate} />
        <UpdatesWidget openTaskView={openTaskView} />
        <ToDoWidget openTaskView={openTaskView} />
        <CasesWidget loading={loading} setLoading={setLoading} />
      </div>
    </div>
  );
};

export default Home;
