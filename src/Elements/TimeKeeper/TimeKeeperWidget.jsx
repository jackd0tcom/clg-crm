import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProjectPicker from "./ProjectPicker";

const TimeKeeperWidget = () => {
  const [showWidget, setShowWidget] = useState(true);
  const [showCaseTaskPicker, setShowCaseTaskPicker] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeEntryId, setTimeEntryId] = useState(0);
  const [casesWithTasks, setCasesWithTasks] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const dropdownRef = useRef(null);
  const [timer, setTimer] = useState(0);
  const [caseId, setCaseId] = useState(1);
  const [notes, setNotes] = useState("");
  const [entry, setEntry] = useState({
    caseId: null,
    taskId: null,
    notes: "",
    currentTitle: null,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCaseTaskPicker(false);
      }
    };

    if (showCaseTaskPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCaseTaskPicker]);

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

  const startTimer = async () => {
    try {
      await axios
        .post("/api/time-entry/start", {
          taskId: entry.taskId,
          caseId: entry.caseId,
          notes: entry.notes,
        })
        .then((res) => {
          setTimeEntryId(res.data.timeEntryId);
          console.log(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const stopTimer = async () => {
    try {
      await axios.post("/api/time-entry/stop", { timeEntryId }).then((res) => {
        console.log(res.data);
        setEntry({
          caseId: null,
          taskId: null,
          notes: "",
        });
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
      setIsRunning(true);
      startTimer();
    } else {
      setIsRunning(false);
      stopTimer();
    }
  };

  const handleProjectClick = () => {
    getCasesWithTasks();
    !showCaseTaskPicker
      ? setShowCaseTaskPicker(true)
      : setShowCaseTaskPicker(false);
  };

  return (
    <div className="time-keeper-widget-wrapper">
      <button className="time-keeper-toggle">
        <i className="fa-solid fa-clock"></i>
      </button>
      {showWidget && (
        <div className="time-keeper-widget-container">
          <div className="time-keeper-widget-first">
            <input
              type="text"
              placeholder="Notes"
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
            />
            <button
              onClick={() => handlePlayButtonClick()}
              className="time-keeper-start-stop"
            >
              <i
                className={!isRunning ? "fa-solid fa-play" : "fa-solid fa-stop"}
              ></i>
            </button>
            {showWarning && (
              <div className="time-keeper-warning-wrapper">
                <p>Choose a Case or Task first!</p>
              </div>
            )}
          </div>
          <div className="time-keeper-widget-second">
            <button disabled={isRunning} onClick={() => handleProjectClick()}>
              {!entry.currentTitle ? "Assign" : entry.currentTitle}
            </button>
            {showCaseTaskPicker && (
              <ProjectPicker
                dropdownRef={dropdownRef}
                casesWithTasks={casesWithTasks}
                entry={entry}
                setEntry={setEntry}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TimeKeeperWidget;
