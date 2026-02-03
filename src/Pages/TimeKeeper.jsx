import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Loader from "../Elements/UI/Loader";
import TimeKeeperWidget from "../Elements/TimeKeeper/TimeKeeperWidget";
import TimeKeeperList from "../Elements/TimeKeeper/TimeKeeperList";
import TimeKeeperFilter from "../Elements/TimeKeeper/TimeKeeperFilter";

const TimeKeeper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [entryList, setEntryList] = useState([]);
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [filter, setFilter] = useState({
    dateRange: {
      startDate: firstDay,
      endDate: lastDay,
    },
    dateUnit: "month",
    caseIds: [],
    taskIds: [],
    sortBy: "dateOpened",
    sortOrder: "desc",
  });

  // Initial data hydration
  const getEntries = async () => {
    try {
      await axios.get("/api/time-entry/getUserEntries").then((res) => {
        if (!res.statusText === "OK") {
          console.log(res);
          return;
        }
        setEntryList(res.data);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getEntries();
  }, []);

  const processedData = useMemo(() => {
    console.log("processing..", filter);
    // setup data variable
    let data = [...entryList];
    // console.log("Raw data", data);

    // filter data
    data = data.filter((item) => {
      // Date range
      if (
        filter.dateRange.startDate &&
        item.startTime < filter.dateRange.startDate.toISOString()
      ) {
        return false;
      }
      if (
        filter.dateRange.endDate &&
        item.startTime > filter.dateRange.endDate.toISOString()
      ) {
        return false;
      }
      // // Practice Areas
      // if (filter.type === "cases" && filter.practiceAreas.length > 0) {
      //   const hasMatchingArea = item.practiceAreas.some((area) =>
      //     filter.practiceAreas.some(
      //       (filterArea) => area.name === filterArea.name,
      //     ),
      //   );
      //   if (!hasMatchingArea) {
      //     return false;
      //   }
      // }
      // // Open or closed cases
      // if (filter.type === "cases" && filter.open && item.status === "closed") {
      //   return false;
      // }
      // if (filter.type === "cases" && !filter.open && item.status !== "closed") {
      //   return false;
      // }

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

    // Sort data for chart
    let sortedChartData = [];
    // Group data by month
    // Gotta figure out what the range is of months, or do I?
    // Gotta return an array of objects

    // // if (chartParams.XAxis === "month") {
    // sortedChartData = sorted.reduce((acc, item) => {
    //   const month = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM format
    //   if (!acc[month]) {
    //     acc[month] = { month: month };
    //   }
    //   acc[month][item.type] = (acc[month][item.type] || 0) + item.value;
    //   return acc;
    // }, {});
    // // }
    console.log("Refined data", sorted);

    return sorted;
  }, [filter]);

  return (
    <div className="time-tracker-page-wrapper">
      <div className="case-list-head">
        <h1 className="section-heading">Time Keeper</h1>
        <TimeKeeperWidget />
      </div>
      <TimeKeeperFilter filter={filter} setFilter={setFilter} />
      {isLoading ? <Loader /> : <TimeKeeperList data={processedData} />}
    </div>
  );
};
export default TimeKeeper;
