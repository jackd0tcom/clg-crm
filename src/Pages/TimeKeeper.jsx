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
        setEntryList(res.data.filter((entry) => entry !== null));
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

    // filter data
    data = data.filter((item) => {
      // filter out weird null entries
      if (!item) {
        return false;
      }
      // filter out entries that somehow don't have startTimes which would cause lots of issues
      if (!item.startTime) {
        return false;
      }
      // Date range
      if (
        filter.dateRange.startDate &&
        item.startTime &&
        item.startTime < filter.dateRange.startDate.toISOString()
      ) {
        return false;
      }
      if (
        filter.dateRange.endDate &&
        item.startTime &&
        item.startTime > filter.dateRange.endDate.toISOString()
      ) {
        return false;
      }
      // Project filter
      if (item.caseId) {
        // if the case filter and task filter is empty, return true
        if (filter.caseIds.length + filter.taskIds.length === 0) {
          return true;
        } else if (!filter.caseIds.includes(item.caseId)) {
          // if there is something in either of them, and the case is not in the filter, don't show it
          return false;
        }
      }
      if (item.taskId) {
        // if the case filter and task filter is empty, return true
        if (filter.taskIds.length + filter.caseIds.length === 0) {
          return true;
        } else if (!filter.taskIds.includes(item.taskId)) {
          // if there is something in either of them, and the task is not in the filter, don't show it
          return false;
        }
      }
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
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        }
      }
    });

    console.log("Refined data", sorted);

    return sorted;
  }, [filter, entryList]);

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
