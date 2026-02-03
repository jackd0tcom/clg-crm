import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePic from "../UI/ProfilePic";
import { useSelector } from "react-redux";
import { getDuration, formatDateNoTime } from "../../helpers/helperFunctions";
import StatusIcon from "../Task/StatusIcon";
import TimeKeeperFilter from "./TimeKeeperFilter";
import WidgetEntryView from "./WidgetEntryView";

const TimeKeeperList = ({ data }) => {
  const userStore = useSelector((state) => state.user);
  const [showEntryView, setShowEntryView] = useState(false);
  const [entry, setEntry] = useState({
    caseId: null,
    taskId: null,
    notes: "",
    startTime: null,
    endTime: null,
    currentTitle: null,
    userId: userStore.userId,
  });

  return showEntryView ? (
    <WidgetEntryView
      entry={entry}
      setEntry={setEntry}
      setShowEntryView={setShowEntryView}
      getEntries={getEntries}
    />
  ) : (
    <div className="time-keeper-list">
      <div className="time-keeper-list-head">
        <p></p>
        <p>Project</p>
        <p>Description</p>
        <p>Duration</p>
        <p>Date</p>
      </div>
      {data?.length > 0 ? (
        data.map((entry) => {
          return (
            <div
              key={entry.timeEntryId}
              className="time-keeper-list-item"
              onClick={() => {
                setEntry({
                  ...entry,
                  timeEntryId: entry.timeEntryId,
                  caseId: entry.caseId,
                  taskId: entry.taskId,
                  notes: entry.notes,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  currentTitle: entry.projectTitle,
                  userId: userStore.userId,
                  status: entry.status || null,
                });
                showEntryView
                  ? setShowEntryView(false)
                  : setShowEntryView(true);
              }}
            >
              <ProfilePic />
              <div className="time-keeper-item-project">
                {entry.caseId ? (
                  <i className="fa-solid fa-briefcase"></i>
                ) : (
                  <StatusIcon
                    status={entry.status}
                    hasIcon={true}
                    hasTitle={false}
                    noBg={true}
                  />
                )}

                {entry.projectTitle}
              </div>
              <p>{entry.notes}</p>
              <p>{getDuration(entry)}</p>
              <p>{formatDateNoTime(entry.createdAt)}</p>
            </div>
          );
        })
      ) : (
        <div className="no-entries">
          <p>No entries available</p>
        </div>
      )}
    </div>
  );
};
export default TimeKeeperList;
