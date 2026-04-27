import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Loader from "../Elements/UI/Loader";
import TimeKeeperWidget from "../Elements/TimeKeeper/TimeKeeperWidget";
import TimeKeeperList from "../Elements/TimeKeeper/TimeKeeperList";
import TimeKeeperFilter from "../Elements/TimeKeeper/TimeKeeperFilter";
import { useSelector } from "react-redux";
import WidgetEntryView from "../Elements/TimeKeeper/WidgetEntryView";
import { useNavigate } from "react-router";

const TimeKeeper = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [entryList, setEntryList] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showEntryView, setShowEntryView] = useState(false);
  const userStore = useSelector((state) => state.user);
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [entry, setEntry] = useState({
    caseId: null,
    taskId: null,
    notes: "",
    currentTitle: null,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    userId: userStore.userId,
  });
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
    paidStatus: "all",
  });

  // Initial data hydration
  const getEntries = async () => {
    console.log("getting entries");
    if (entryList.length > 0) {
      setIsLoading(false);
      return;
    }
    try {
      await axios.get("/api/time-entry/getUserEntries").then((res) => {
        if (!res.status === 200) {
          console.log(res);
          return;
        }
        console.log("got entries");
        setEntryList(res.data.filter((entry) => entry !== null));
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getAllEntries = async () => {
    setIsLoading(true);
    if (allEntries.length > 0) {
      setIsLoading(false);
      return;
    }
    try {
      console.log("getting all entries");
      await axios.get("/api/time-entry/getAllEntries").then((res) => {
        setAllEntries(res.data.filter((entry) => entry !== null));
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEntries();
  }, []);

  useEffect(() => {
    if (userStore.userId == null) {
      return;
    }
    setEntry((prev) =>
      prev.userId == null ? { ...prev, userId: userStore.userId } : prev,
    );
  }, [userStore.userId, showEntryView]);

  const processedData = useMemo(() => {
    // console.log("processing..", filter);
    // setup data variable
    let data = [];

    if (!showAllEntries) {
      data = [...entryList];
    } else {
      data = [...allEntries];
    }

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
      // Date range (normalize in case startDate/endDate are Date objects or timestamps)
      const rangeStart = filter.dateRange.startDate
        ? new Date(filter.dateRange.startDate)
        : null;
      const rangeEnd = filter.dateRange.endDate
        ? new Date(filter.dateRange.endDate)
        : null;
      if (
        rangeStart &&
        item.startTime &&
        item.startTime < rangeStart.toISOString()
      ) {
        return false;
      }
      if (
        rangeEnd &&
        item.startTime &&
        item.startTime > rangeEnd.toISOString()
      ) {
        return false;
      }
      // Status filter
      if (filter.paidStatus !== "all")
        if (item.paidStatus !== filter.paidStatus) {
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
        } else if (
          filter.taskIds.length === 0 &&
          filter.caseIds.includes(item.taskCaseId)
        ) {
          // If there is no task selected, but there is a case selected and the taskCaseId matches, include the tasks
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

    // console.log("Refined data", sorted);

    return sorted;
  }, [filter, entryList, allEntries, showAllEntries]);

  const newInvoice = async () => {
    const entryArray = processedData.map((entry) => entry.timeEntryId);
    try {
      axios.post("/api/newInvoice", { entries: entryArray }).then((res) => {
        if (res.status === 200) {
          navigate(`/invoice/${res.data.invoiceId}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="time-tracker-page-wrapper">
      <div className="case-list-head">
        <h1 className="section-heading">Time Keeper</h1>
        <div className="time-keeper-filter-buttons">
          <div className="new-entry-button-wrapper">
            <button onClick={() => newInvoice()} className="new-invoice-button">
              Create Invoice
            </button>
          </div>
          <div className="new-entry-button-wrapper">
            <button
              onClick={() =>
                showEntryView ? setShowEntryView(false) : setShowEntryView(true)
              }
              className="new-entry-button"
            >
              New Entry
            </button>
          </div>
        </div>
      </div>
      {showEntryView ? (
        <WidgetEntryView
          entry={entry}
          setEntry={setEntry}
          setShowEntryView={setShowEntryView}
          getEntries={getEntries}
        />
      ) : (
        <>
          <TimeKeeperFilter
            setIsLoading={setIsLoading}
            filter={filter}
            setFilter={setFilter}
            entries={processedData}
            showEntryView={showEntryView}
            setShowEntryView={setShowEntryView}
            getAllEntries={getAllEntries}
            setShowAllEntries={setShowAllEntries}
            showAllEntries={showAllEntries}
          />
          {isLoading ? (
            <Loader />
          ) : (
            <TimeKeeperList data={processedData} getEntries={getEntries} />
          )}
        </>
      )}
    </div>
  );
};
export default TimeKeeper;
