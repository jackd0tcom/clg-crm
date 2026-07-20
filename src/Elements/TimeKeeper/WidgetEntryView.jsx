import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getDuration } from "../../helpers/helperFunctions";
import ProjectPicker from "./ProjectPicker";
import TimePicker from "./TimePicker";
import UserPicker from "./UserPicker";
import EntryServicePicker from "./EntryServicePicker";
import RateSelector from "../UI/RateSelector";

const WidgetEntryView = ({
  entry,
  setEntry,
  setShowEntryView,
  getEntries,
  entryServices,
  widgetView,
  setEntriesRefreshKey,
  caseId,
  taskId,
  title,
  rates,
}) => {
  const userStore = useSelector((state) => state.user);
  const [notes, setNotes] = useState(entry?.notes);
  const [status, setStatus] = useState("");
  const [showCaseTaskPicker, setShowCaseTaskPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const resolvedUserId = entry.userId ?? userStore.userId;

  const duration = getDuration(entry);
  const isProject = entry.caseId || entry.taskId;
  const canSave = entry.entryServiceId && isProject && duration !== "0:00:00";

  const newEntry = async () => {
    setStatus("saving");
    if (!entry.caseId && !entry.taskId) {
      setStatus("no project");
      setTimeout(() => {
        setStatus("");
      }, 2000);
      return;
    }
    try {
      await axios
        .post("/api/time-entry/newEntry", {
          notes,
          caseId: entry.caseId,
          taskId: entry.taskId,
          startTime: entry.startTime,
          endTime: entry.endTime,
          entryServiceId: entry.entryServiceId,
          userId: resolvedUserId,
          rateId: entry.rateId ?? null,
        })
        .then((res) => {
          setStatus("success");
          setEntry({
            caseId: caseId ? caseId : null,
            taskId: taskId ? taskId : null,
            notes: "",
            currentTitle: title ? title : "",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            entryServiceId: null,
            userId: userStore.userId ?? null,
            rateId: userStore.rateId ?? null,
          });
          setShowEntryView(false);
          getEntries?.();
          setEntriesRefreshKey?.((prev) => (prev += 1));
        });
    } catch (error) {
      setStatus("error");
      console.log(error);
    }
  };

  const updateEntry = async (hide) => {
    console.log("saving", entry.rateId);
    setStatus("saving");
    try {
      await axios
        .post("/api/time-entry/update", {
          timeEntryId: entry.timeEntryId,
          notes,
          caseId: entry.caseId,
          taskId: entry.taskId,
          startTime: entry.startTime,
          endTime: entry.endTime,
          entryServiceId: entry.entryServiceId,
          userId: resolvedUserId,
          rateId: entry.rateId,
        })
        .then((res) => {
          setStatus("success");
          if (hide) {
            setEntry({
              caseId: caseId ? caseId : null,
              taskId: taskId ? taskId : null,
              notes: "",
              currentTitle: title ? title : "",
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              entryServiceId: null,
              userId: userStore.userId ?? null,
              rateId: userStore.rateId ?? null,
            });
            setShowEntryView(false);
            getEntries?.();
            setEntriesRefreshKey?.((prev) => (prev += 1));
          }
        });
    } catch (error) {
      setStatus("error");
      console.log(error);
    }
  };

  const deleteEntry = async () => {
    setStatus("deleting");
    try {
      await axios
        .post("/api/time-entry/delete", {
          timeEntryId: entry.timeEntryId,
        })
        .then((res) => {
          setStatus("success");
          setShowDeleteModal(false);
          setShowEntryView(false);
          getEntries?.();
        });
    } catch (error) {
      setStatus("error");
      console.log(error);
    }
  };

  const increment = () => {
    // move endtime up
    const date = new Date(entry.endTime);
    const newDate = new Date(
      date.setMinutes(date.getMinutes() + 15),
    ).toISOString();
    const newEntry = { ...entry, endTime: newDate };
    setEntry(newEntry);
  };

  const decrement = () => {
    // move endtime up
    const date = new Date(entry.endTime);
    const newDate = new Date(
      date.setMinutes(date.getMinutes() - 15),
    ).toISOString();
    if (newDate < entry.startTime.toISOString()) {
      return;
    }
    const newEntry = { ...entry, endTime: newDate };
    setEntry(newEntry);
  };

  const handleUpdateEntry = (rateId) => {
    setEntry({ ...entry, rateId: rateId });
  };

  return (
    <div
      className={
        widgetView ? "widget-entry-view-wrapper" : "entry-view-wrapper"
      }
    >
      {!widgetView && (
        <p
          className="back-button"
          onClick={() => {
            setShowEntryView(false);
            setEntry({
              caseId: null,
              taskId: null,
              notes: "",
              currentTitle: null,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              entryServiceId: null,
              userId: userStore.userId ?? null,
              rateId: userStore.rateId ?? null,
            });
          }}
        >
          Back
        </p>
      )}
      <div
        className={
          widgetView ? "widget-entry-view-container" : "entry-view-container"
        }
      >
        {showDeleteModal ? (
          <>
            <p>Are you sure you want to delete this time entry?</p>
            <button
              onClick={() => deleteEntry()}
              className="entry-delete-button"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="entry-cancel-button"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="duration-input-wrapper">
              <button onClick={decrement} className="time-increment">
                -15
              </button>
              <p
                onClick={() => setShowTimePicker(true)}
                className="duration-input"
              >
                {duration}
              </p>
              <button onClick={increment} className="time-increment">
                +15
              </button>
              {showTimePicker && (
                <TimePicker
                  entry={entry}
                  setEntry={setEntry}
                  duration={duration}
                  setShowTimePicker={setShowTimePicker}
                  showTimePicker={showTimePicker}
                  updateEntry={updateEntry}
                />
              )}
            </div>
            <EntryServicePicker
              entryServices={entryServices}
              entry={entry}
              setEntry={setEntry}
            />
            <div className="picker-notes-wrapper">
              <UserPicker userId={entry.userId} setEntry={setEntry} />
              <RateSelector
                user={userStore}
                rates={rates}
                handleUpdateUser={handleUpdateEntry}
                entry={entry}
                handleUpdateEntry={handleUpdateEntry}
              />
              <ProjectPicker
                showCaseTaskPicker={showCaseTaskPicker}
                setShowCaseTaskPicker={setShowCaseTaskPicker}
                entry={entry}
                setEntry={setEntry}
              />
            </div>
            <div className="entry-button-wrapper">
              {status === "no project" && (
                <div className="no-project">Please add a task or case</div>
              )}
              {canSave && (
                <button
                  onClick={() => {
                    entry.timeEntryId ? updateEntry(true) : newEntry();
                  }}
                  className="entry-save-button"
                >
                  Save
                </button>
              )}
              {!widgetView && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="entry-delete-button"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default WidgetEntryView;
