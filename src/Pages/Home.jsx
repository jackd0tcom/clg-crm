import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import StoriesList from "../Elements/StoriesList.jsx";
import FriendStoryList from "../Elements/FriendStoryList.jsx";
import LastStory from "../Elements/LastStory.jsx";

const Home = () => {
  const userId = useSelector((state) => state.userId);

  const navigate = useNavigate();
  return !userId ? (
    <section>
      <div>
        <h2>Welcome to</h2>
        <h1>Writer</h1>

        <div>
          <p>Start writing</p>
        </div>
        <button onClick={() => navigate("/login")}>Get Started</button>
      </div>
    </section>
  ) : (
    <div className="home-container">
      <h1>Write & Pass</h1>
      <div className="write-cta-container">
        <button onClick={() => navigate("/new-story")}>
          Start A New Story
        </button>
      </div>
      <LastStory userId={userId} />
      <h3>See what your friends are up to...</h3>
      <FriendStoryList />
    </div>
  );
};

export default Home;
