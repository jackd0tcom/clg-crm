import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ReportBreakdown from "../Elements/Reports/ReportBreakdown";
import ReportChart from "../Elements/Reports/ReportChart";
import ReportFilter from "../Elements/Reports/ReportFilter";
import Loader from "../Elements/UI/Loader";

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [caseData, setCaseData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [filter, setFilter] = useState({
    type: "",
    dateRange: {
      start: `${year}-${month + 1}-01`,
      end: `${year}-${month + 1}-${lastDay.getDate()}`,
    },
    practiceAreas: [],
    sortBy: "dateOpened",
    sortOrder: "desc",
  });

  // Initial data hydration
  useEffect(() => {
    const fetchCases = async () => {
      try {
        await axios.get("/api/getReportCases").then((res) => {
          if (res.statusText === "OK") {
            console.log("Cases", res.data[0]);
            setCaseData(res.data);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchTasks = async () => {
      try {
        await axios.get("/api/getReportTasks").then((res) => {
          if (res.statusText === "OK") {
            console.log("Tasks", res.data[0]);
            setTaskData(res.data);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchCases();
    fetchTasks();
    setTimeout(() => {
      setIsLoading(false);
      setFilter({ ...filter, type: "cases" });
    }, 200);
  }, []);

  let columns;
  if (filter.type === "cases") {
    columns = "2fr 1fr 1fr 1fr";
  } else columns = "2fr 1fr 1fr 1fr";

  // Main data manipulator
  const processedData = useMemo(() => {
    console.log("processing..", filter);
    // setup data variable
    let data = filter.type === "cases" ? caseData : taskData;
    // console.log("Raw data", data);

    // filter data
    data = data.filter((item) => {
      // Date range
      if (filter.dateRange.start && item.createdAt < filter.dateRange.start) {
        return false;
      }
      if (filter.dateRange.end && item.createdAt > filter.dateRange.end) {
        return false;
      }
      if (filter.type === "cases" && filter.practiceAreas.length > 0) {
        const hasMatchingArea = item.practiceAreas.some((area) =>
          filter.practiceAreas.some(
            (filterArea) => area.name === filterArea.name
          )
        );
        if (!hasMatchingArea) {
          return false;
        }
      }

      // No filters added - see all items
      return true;
    });

    // sort data
    const sorted = [...data].sort((a, b) => {
      // dateOpened
      if (filter.sortBy === "dateOpened") {
        if (filter.sortOrder === "desc") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      }
    });

    console.log("Refined data", sorted);

    return sorted;
  }, [filter]);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="report-page-wrapper">
      <div className="case-list-head">
        <div className="case-list-head-heading-wrapper">
          <h1 className="section-heading">Reports</h1>
        </div>
      </div>
      <div className="report-body">
        <ReportFilter filter={filter} setFilter={setFilter} />
        <ReportChart data={processedData} />
        <ReportBreakdown
          data={processedData}
          columns={columns}
          type={filter.type}
        />
      </div>
    </div>
  );
};
export default Reports;
