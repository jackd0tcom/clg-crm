import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { capitalize } from "../helpers/helperFunctions";
import CaseListItem from "../Elements/CaseListItem";
import axios from "axios";
import Loader from "../Elements/Loader";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [cases, setCases] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getCases").then((res) => {
          setCases(res.data);
          setIsLoading(false);
        });
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, []);

  return !isAuthenticated ? (
    <section>
      <div className="home-landing-container">
        <h2>Welcome to</h2>
        <h1>Clause Law Group</h1>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </section>
  ) : isLoading ? (
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
