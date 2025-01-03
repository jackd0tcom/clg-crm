import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import Writer from "../Elements/Writer";
import StoriesList from "../Elements/StoriesList.jsx";
import Nav from "../Elements/Nav.jsx";

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
    <>
      <StoriesList />
    </>
  );
};

export default Home;
