import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { timerStarted, timerStopped, timerUpdated } from "../../store/reducer";
import { useSelector } from "react-redux";
import axios from "axios";
import ProjectPicker from "./ProjectPicker";
import Timer from "./Timer";
import WidgetEntryList from "./WidgetEntryList";
import WidgetEntryView from "./WidgetEntryView";
import UserPicker from "./UserPicker";

const TimeKeeperWidget = ({ caseId, title, taskId, isNav }) => {
  const dispatch = useDispatch();
  const [showWidget, setShowWidget] = useState(false);
  const userStore = useSelector((state) => state.user);
  const [showCaseTaskPicker, setShowCaseTaskPicker] = useState(false);
  const isRunning = useSelector((state) => state.isRunning);
  const reduxStartTime = useSelector((state) => state.startTime);
  const [timeEntryId, setTimeEntryId] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const widgetRef = useRef(null);
  const [resetTimer, setResetTimer] = useState(false);
  const [showEntryView, setShowEntryView] = useState(false);
  const [entriesRefreshKey, setEntriesRefreshKey] = useState(0);
  const [entry, setEntry] = useState({
    caseId: caseId ? caseId : null,
    taskId: taskId ? taskId : null,
    notes: "",
    currentTitle: title ? title : "",
    startTime: null,
    userId: userStore.userId,
  });

  // When Redux says timer is running but this instance doesn't have the entry, fetch it
  useEffect(() => {
    if (isRunning && !timeEntryId) {
      fetch();
    }
  }, [isRunning]);

  const navProjectTitle = entry.currentTitle ? entry.currentTitle : "";

  useEffect(() => {
    fetch();
  }, []);

  //   Checks for an actively running timer, and if so set's everything up accordingly
  const fetch = async () => {
    try {
      await axios.get("/api/time-entry/running-timer").then((res) => {
        if (res.statusText !== "OK") {
          console.log(error);
          return;
        }
        if (res.data !== "No active entries") {
          setTimeEntryId(res.data.timeEntryId);
          setEntry({
            caseId: res.data.caseId,
            taskId: res.data.taskId,
            notes: res.data.notes,
            startTime: res.data.startTime,
            currentTitle: res.data.case.title,
          });
          dispatch(timerStarted({ startTime: res.data.startTime }));
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setShowWidget(false);
        setShowEntryView(false);
        setShowCaseTaskPicker(false);
        if (!isRunning) {
          setEntry({
            caseId: null,
            taskId: null,
            notes: "",
            currentTitle: "",
            startTime: null,
            userId: userStore.userId,
          });
        }
      }
    };

    if (showWidget) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWidget, isRunning]);

  const startTimer = async (entryOverride) => {
    const data = entryOverride || entry;
    try {
      await axios
        .post("/api/time-entry/start", {
          taskId: data.taskId,
          caseId: data.caseId,
          notes: data.notes,
          userId: entry.userId ? entry.userId : userStore.userId,
        })
        .then((res) => {
          setEntry({
            ...(entryOverride || entry),
            startTime: res.data.startTime,
            ...(entryOverride?.currentTitle != null && {
              currentTitle: entryOverride.currentTitle,
            }),
          });
          setTimeEntryId(res.data.timeEntryId);
          dispatch(timerStarted({ startTime: res.data.startTime }));
        });
    } catch (error) {
      console.log(error);
    }
  };

  const stopTimer = async () => {
    try {
      await axios.post("/api/time-entry/stop", { timeEntryId }).then((res) => {
        setResetTimer(true);
        setEntry({
          caseId: null,
          taskId: null,
          notes: "",
          userId: userStore.userId,
        });
        // Reset the resetTimer flag after a brief moment
        setTimeout(() => setResetTimer(false), 100);
        dispatch(timerStopped());
      });
    } catch (error) {
      console.log(error);
    }
    setEntriesRefreshKey(entriesRefreshKey + 1);
  };

  const handlePlayButtonClick = () => {
    if (!entry.caseId && !entry.taskId) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 2000);
      return;
    }
    if (!isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
  };

  const handleProjectClick = (e) => {
    if (!showCaseTaskPicker) {
      setShowCaseTaskPicker(true);
    } else {
      setShowCaseTaskPicker(false);
    }
  };

  const addFifteen = () => {
    const date = new Date(entry.startTime);
    const newDate = new Date(
      date.setMinutes(date.getMinutes() - 15),
    ).toISOString();
    const newEntry = { ...entry, startTime: newDate };
    setEntry(newEntry);
    updateEntry(newEntry).then(() => {
      dispatch(timerUpdated({ startTime: newDate }));
    });
  };

  const updateEntry = async (newEntry) => {
    try {
      return await axios.post("/api/time-entry/update", {
        timeEntryId: timeEntryId,
        notes: newEntry.notes,
        caseId: newEntry.caseId,
        taskId: newEntry.taskId,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
      });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="time-keeper-widget-wrapper" ref={widgetRef}>
      <button
        className={
          isNav
            ? isRunning
              ? "nav-time-keeper-widget running-timer"
              : "nav-time-keeper-widget"
            : !isRunning
              ? "time-keeper-toggle"
              : "time-keeper-toggle running-button"
        }
        onClick={() =>
          !showWidget ? setShowWidget(true) : setShowWidget(false)
        }
      >
        <i className="fa-solid fa-clock"></i>
        {isNav && (
          <p className="time-keeper-nav-title">
            {isRunning ? navProjectTitle : "Start Timer"}
          </p>
        )}
      </button>
      {showWidget && (
        <div
          className={
            isNav
              ? "time-keeper-widget-container nav-time-keeper"
              : "time-keeper-widget-container"
          }
        >
          {showEntryView ? (
            <WidgetEntryView
              entry={entry}
              setEntry={setEntry}
              setShowEntryView={setShowEntryView}
            />
          ) : (
            <>
              <div className="time-keeper-widget-first">
                <input
                  className="time-keeper-description"
                  type="text"
                  placeholder="Description"
                  value={entry.notes}
                  onChange={(e) =>
                    setEntry({ ...entry, notes: e.target.value })
                  }
                />
                <div className="time-keeper-widget-timer-wrapper">
                  <Timer
                    isRunning={isRunning}
                    reset={resetTimer}
                    startTime={
                      isRunning && reduxStartTime != null
                        ? reduxStartTime
                        : entry.startTime
                    }
                  />
                  <button
                    onClick={() => handlePlayButtonClick()}
                    className={
                      !isRunning
                        ? "time-keeper-start-stop"
                        : "time-keeper-start-stop running-toggle"
                    }
                  >
                    <i
                      className={
                        !isRunning ? "fa-solid fa-play" : "fa-solid fa-stop"
                      }
                    ></i>
                  </button>
                </div>
                {showWarning && (
                  <div className="time-keeper-warning-wrapper">
                    <p>Choose a Case or Task first!</p>
                  </div>
                )}
              </div>
              <div className="time-keeper-widget-second">
                <div className="time-keeper-widget-pickers">
                  <UserPicker
                    userId={userStore.userId}
                    entry={entry}
                    setEntry={setEntry}
                  />
                  <ProjectPicker
                    entry={entry}
                    setEntry={setEntry}
                    showCaseTaskPicker={showCaseTaskPicker}
                    setShowCaseTaskPicker={setShowCaseTaskPicker}
                  />
                </div>
                <div className="quick-add-wrapper">
                  <button
                    disabled={!isRunning}
                    onClick={addFifteen}
                    className="time-increment"
                  >
                    +15 Min
                  </button>
                </div>
              </div>
              <WidgetEntryList
                entry={entry}
                setEntry={setEntry}
                startTimer={startTimer}
                setShowEntryView={setShowEntryView}
                entriesRefreshKey={entriesRefreshKey}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default TimeKeeperWidget;
