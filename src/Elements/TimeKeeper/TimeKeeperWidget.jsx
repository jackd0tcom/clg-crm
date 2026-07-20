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
import EntryServicePicker from "./EntryServicePicker";

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
  const [entryServices, setEntryServices] = useState([]);
  const [rates, setRates] = useState([]);
  const [entry, setEntry] = useState({
    caseId: caseId ? caseId : null,
    taskId: taskId ? taskId : null,
    notes: "",
    currentTitle: title ? title : "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    userId: userStore.userId,
    entryServiceId: null,
    rateId: userStore.rateId ?? null,
  });

  const navProjectTitle = entry.currentTitle ? entry.currentTitle : "";

  //   Checks for an actively running timer, and if so set's everything up accordingly
  const fetch = async () => {
    try {
      const res = await axios.get("/api/time-entry/running-timer");
      setEntryServices(res.data.entryServices ?? []);
      setRates(res.data.rates ?? []);
      if (res.data.timeEntryId) {
        setTimeEntryId(res.data.timeEntryId);
        setEntry({
          caseId: res.data.caseId,
          taskId: res.data.taskId,
          notes: res.data.notes,
          startTime: res.data.startTime,
          endTime: res.data.endTime,
          currentTitle: res.data.case?.title ?? "",
          entryServiceId: res.data.entryServiceId ?? null,
          userId: res.data.userId ?? userStore.userId,
          rateId: res.data.rateId ?? userStore.rateId ?? null,
        });
        dispatch(timerStarted({ startTime: res.data.startTime }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userStore.userId) return;
    fetch();
  }, [userStore.userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setShowWidget(false);
        setShowEntryView(false);
        setShowCaseTaskPicker(false);
        setEntry({
          caseId: caseId ? caseId : null,
          taskId: taskId ? taskId : null,
          notes: "",
          currentTitle: title ? title : "",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          entryServiceId: null,
          userId: userStore.userId,
          rateId: userStore.rateId ?? null,
        });
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
          caseId: caseId ? caseId : null,
          taskId: taskId ? taskId : null,
          notes: "",
          currentTitle: title ? title : "",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          entryServiceId: null,
          userId: userStore.userId,
          rateId: userStore.rateId ?? null,
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
        onClick={() => {
          if (!showWidget) {
            setShowWidget(true);
            if (!entryServices.length || !rates.length) {
              fetch();
            }
          } else {
            setShowWidget(false);
          }
        }}
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
              entryServices={entryServices}
              widgetView={false}
              setEntriesRefreshKey={setEntriesRefreshKey}
              caseId={caseId}
              taskId={taskId}
              title={title}
              rates={rates}
            />
          ) : (
            <>
              <WidgetEntryView
                entry={entry}
                setEntry={setEntry}
                setShowEntryView={setShowEntryView}
                entryServices={entryServices}
                widgetView={true}
                setEntriesRefreshKey={setEntriesRefreshKey}
                caseId={caseId}
                taskId={taskId}
                title={title}
                rates={rates}
              />
              <WidgetEntryList
                entry={entry}
                setEntry={setEntry}
                entryServices={entryServices}
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
