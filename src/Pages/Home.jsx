import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { capitalize } from "../helpers/helperFunctions";
import CaseListItem from "../Elements/CaseListItem";
import axios from "axios";
import Loader from "../Elements/Loader";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../Elements/LogoutButton";
import LoginButton from "../Elements/LoginButton";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [cases, setCases] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getCases").then((res) => {
          setCases(res.data);
          setLoading(false);
        });
      } catch (error) {
        console.log(error);
      }
    }
    !isLoading && fetch();
  }, []);

  return !isAuthenticated ? (
    <section className="home-landing-section">
      <div className="home-landing-container">
        <h2>Welcome to</h2>
        <h1>Clause Law Group</h1>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </section>
  ) : loading ? (
    <Loader />
  ) : (
    <div className="home-container">
      <h1>Dashboard</h1>
      <div className="widget-wrapper">
        <div className="widget-container">
          <p>Recent Tasks</p>
        </div>
        <div className="widget-container">
          <p>Updates</p>
        </div>{" "}
        <div className="widget-container">
          <p>To Do</p>
        </div>{" "}
        <div className="widget-container">
          <a
            onClick={() => navigate("/cases")}
            className="widget-container-heading"
          >
            My Cases
          </a>
          <div className="case-widget-container">
            {cases.length > 0 ? (
              cases.map((data) => {
                return <CaseListItem key={data.caseId} data={data} />;
              })
            ) : (
              <>You are not assigned to any cases</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
