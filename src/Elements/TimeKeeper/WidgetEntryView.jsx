import { useState, useEffect } from "react";
import axios from "axios";
import { getDuration } from "../../helpers/helperFunctions";
import ProjectPicker from "./ProjectPicker";
import TimePicker from "./TimePicker";

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

  const updateEntry = async () => {
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
        })
        .then((res) => {
          setStatus("success");
          console.log(res);
          setShowEntryView(false);
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
              <input
                type="text"
                value={duration}
                onClick={() => setShowTimePicker(true)}
                className="duration-input"
              />
              {showTimePicker && (
                <TimePicker
                  entry={entry}
                  setEntry={setEntry}
                  duration={duration}
                  setDuration={setDuration}
                />
              )}
            </div>
            <input
              onChange={(e) => setNotes(e.target.value)}
              type="text"
              value={notes}
              placeholder="Add a description"
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
            <button onClick={() => updateEntry()} className="entry-save-button">
              Save
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="entry-delete-button"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
export default WidgetEntryView;
