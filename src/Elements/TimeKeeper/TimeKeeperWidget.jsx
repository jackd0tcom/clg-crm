import { useEffect, useState, useRef } from "react";
import axios from "axios";

const TimeKeeperWidget = () => {
  const [showWidget, setShowWidget] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [timeEntryId, setTimeEntryId] = useState(0);
  const [timer, setTimer] = useState(0);
  const [caseId, setCaseId] = useState(1);
  const [notes, setNotes] = useState("");

  const startTimer = async () => {
    try {
      await axios
        .post("/api/time-entry/start", { caseId, notes })
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
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleButtonClick = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimer();
    } else {
      setIsRunning(false);
      stopTimer();
    }
  };

  return (
    <div className="time-keeper-widget-wrapper">
      <button className="time-keeper-toggle">
        <i className="fa-solid fa-clock"></i>
      </button>
      {showWidget && (
        <div className="time-keeper-widget-container">
          <div className="time-keeper-widget-first">
            <input type="text" placeholder="Notes" />
            <button
              onClick={() => handleButtonClick()}
              className="time-keeper-start-stop"
            >
              <i
                className={!isRunning ? "fa-solid fa-play" : "fa-solid fa-stop"}
              ></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TimeKeeperWidget;
