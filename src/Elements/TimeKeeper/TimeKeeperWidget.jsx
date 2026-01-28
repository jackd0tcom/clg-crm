import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProjectPicker from "./ProjectPicker";
import Timer from "./Timer";
import WidgetEntryList from "./WidgetEntryList";
import WidgetEntryView from "./WidgetEntryView";

const TimeKeeperWidget = () => {
  const [showWidget, setShowWidget] = useState(false);
  const [showCaseTaskPicker, setShowCaseTaskPicker] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeEntryId, setTimeEntryId] = useState(0);
  const [casesWithTasks, setCasesWithTasks] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const widgetRef = useRef(null);
  const [resetTimer, setResetTimer] = useState(false);
  const [showEntryView, setShowEntryView] = useState(false);
  const [entry, setEntry] = useState({
    caseId: null,
    taskId: null,
    notes: "",
    currentTitle: null,
    startTime: null,
  });

  //   Checks for an actively running timer, and if so set's everything up accordingly
  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/time-entry/running-timer").then((res) => {
          if (res.statusText !== "OK") {
            console.log(error);
            return;
          }
          if (res.data !== "OK") {
            console.log(res);
            setTimeEntryId(res.data.timeEntryId);
            setEntry({
              caseId: res.data.caseId,
              taskId: res.data.taskId,
              notes: res.data.notes,
              startTime: res.data.startTime,
              currentTitle: res.data.case.title,
            });
            setIsRunning(true);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setShowWidget(false);
        setShowEntryView(false);
        setShowCaseTaskPicker(false);
      }
    };

    if (showWidget) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWidget]);

  const getCasesWithTasks = async () => {
    try {
      await axios.get("/api/getCasesWithTasks").then((res) => {
        if (!res.statusText === "OK") {
          console.log(error);
          return;
        }
        setCasesWithTasks(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const startTimer = async (entryOverride) => {
    const data = entryOverride || entry;
    try {
      await axios
        .post("/api/time-entry/start", {
          taskId: data.taskId,
          caseId: data.caseId,
          notes: data.notes,
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
          setIsRunning(true);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const stopTimer = async () => {
    try {
      await axios.post("/api/time-entry/stop", { timeEntryId }).then((res) => {
        console.log(res.data);
        setIsRunning(false);
        setResetTimer(true);
        setEntry({
          caseId: null,
          taskId: null,
          notes: "",
        });
        // Reset the resetTimer flag after a brief moment
        setTimeout(() => setResetTimer(false), 100);
      });
    } catch (error) {
      console.log(error);
    }
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
      getCasesWithTasks();
      setShowCaseTaskPicker(true);
    } else {
      setShowCaseTaskPicker(false);
    }
  };

  return (
    <div className="time-keeper-widget-wrapper" ref={widgetRef}>
      <button
        className={
          !isRunning
            ? "time-keeper-toggle"
            : "time-keeper-toggle running-button"
        }
        onClick={() =>
          !showWidget ? setShowWidget(true) : setShowWidget(false)
        }
      >
        <i className="fa-solid fa-clock"></i>
      </button>
      {showWidget && (
        <div className="time-keeper-widget-container">
          {showEntryView ? (
            <WidgetEntryView
              entry={entry}
              setEntry={setEntry}
              setShowEntryView={setShowEntryView}
              casesWithTasks={casesWithTasks}
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
                    startTime={entry.startTime}
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
                <button
                  className="project-picker-button"
                  disabled={isRunning}
                  onClick={() => handleProjectClick()}
                >
                  {!entry.currentTitle ? "Choose Project" : entry.currentTitle}
                </button>
                {showCaseTaskPicker && (
                  <ProjectPicker
                    casesWithTasks={casesWithTasks}
                    entry={entry}
                    setEntry={setEntry}
                    showCaseTaskPicker={showCaseTaskPicker}
                    setShowCaseTaskPicker={setShowCaseTaskPicker}
                  />
                )}
              </div>
              <WidgetEntryList
                entry={entry}
                setEntry={setEntry}
                startTimer={startTimer}
                setShowEntryView={setShowEntryView}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default TimeKeeperWidget;
