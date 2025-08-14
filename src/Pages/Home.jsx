import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { capitalize } from "../helpers/helperFunctions";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.isAuthenticated);

  const navigate = useNavigate();
  return !isAuthenticated ? (
    <section>
      <div>
        <h2>{capitalize("Welcome to")}</h2>
        <h1>CLG</h1>
        <button onClick={() => navigate("/login")}>Get Started</button>
      </div>
    </section>
  ) : (
    <div className="home-container">
      <h1>CLG CRM</h1>
    </div>
  );
};

export default Home;
