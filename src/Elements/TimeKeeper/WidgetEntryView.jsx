import { useState, useEffect } from "react";
import axios from "axios";
import { getDuration } from "../../helpers/helperFunctions";
import ProjectPicker from "./ProjectPicker";
import TimePicker from "./TimePicker";
import UserPicker from "./UserPicker";

const WidgetEntryView = ({
  entry,
  setEntry,
  setShowEntryView,
  casesWithTasks,
}) => {
  const [notes, setNotes] = useState(entry?.notes);
  const [status, setStatus] = useState("");
  const [showCaseTaskPicker, setShowCaseTaskPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [duration, setDuration] = useState(entry.endTime && getDuration(entry));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const userId = entry.userId;

  const updateEntry = async (hide) => {
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
          userId: entry.userId,
        })
        .then((res) => {
          setStatus("success");
          console.log(res);
          if (hide) {
            setEntry({
              caseId: null,
              taskId: null,
              notes: "",
              currentTitle: null,
              startTime: null,
            });
            setShowEntryView(false);
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
          console.log(res);
          setShowDeleteModal(false);
          setShowEntryView(false);
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
    setDuration(getDuration(newEntry));
  };

  const decrement = () => {
    // move endtime up
    const date = new Date(entry.endTime);
    const newDate = new Date(
      date.setMinutes(date.getMinutes() - 15),
    ).toISOString();
    const newEntry = { ...entry, endTime: newDate };
    setEntry(newEntry);
    setDuration(getDuration(newEntry));
  };

  return (
    <div className="entry-view-wrapper">
      <p className="back-button" onClick={() => setShowEntryView(false)}>
        Back
      </p>
      <div className="entry-view-container">
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
                  setDuration={setDuration}
                  setShowTimePicker={setShowTimePicker}
                  showTimePicker={showTimePicker}
                  updateEntry={updateEntry}
                />
              )}
            </div>
            <input
              className="entry-view-description"
              onChange={(e) => setNotes(e.target.value)}
              type="text"
              value={notes}
              placeholder="Add a description"
            />
            <div className="picker-notes-wrapper">
              <UserPicker
                userId={entry.userId}
                entry={entry}
                setEntry={setEntry}
              />
              <button
                className="project-picker-button"
                onClick={() => {
                  showCaseTaskPicker
                    ? setShowCaseTaskPicker(false)
                    : setShowCaseTaskPicker(true);
                }}
              >
                {!entry.currentTitle ? "Choose Project" : entry.currentTitle}
              </button>
              {showCaseTaskPicker && (
                <ProjectPicker
                  showCaseTaskPicker={showCaseTaskPicker}
                  setShowCaseTaskPicker={setShowCaseTaskPicker}
                  entry={entry}
                  setEntry={setEntry}
                  casesWithTasks={casesWithTasks}
                />
              )}
            </div>
            <div className="entry-button-wrapper">
              <button
                onClick={() => updateEntry(true)}
                className="entry-save-button"
              >
                Save
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="entry-delete-button"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default WidgetEntryView;
