import { useState, useEffect } from "react";
import axios from "axios";

const Reports = () => {
  const [caseData, setCaseData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [showCases, setShowCases] = useState(false);
  const [currentData, setCurrentData] = useState([]);

  const fetchCases = async () => {
    try {
      await axios.get("/api/getReportCases").then((res) => {
        if (res.statusText === "OK") {
          setCaseData(res.data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Initial data hydration - default to showing cases
  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="reports-page-wrapper">
      <div className="case-list-head">
        <div className="case-list-head-heading-wrapper">
          <h1 className="section-heading">Reports</h1>
        </div>
      </div>
    </div>
  );
};
export default Reports;
