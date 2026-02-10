import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePic from "../UI/ProfilePic";
import { useSelector } from "react-redux";
import { getDuration, formatDateNoTime } from "../../helpers/helperFunctions";
import StatusIcon from "../Task/StatusIcon";
import WidgetEntryView from "./WidgetEntryView";
import TimeKeeperListGroup from "./TimeKeeperListGroup";
import { getDurationNumber } from "../../helpers/helperFunctions";

const TimeKeeperList = ({ data, getEntries }) => {
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

  const groupedByProject = Object.values(
    data.reduce((groups, entry) => {
      const groupKey = entry.caseId
        ? `case-${entry.caseId}`
        : `task-${entry.taskId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: entry.caseId ?? entry.taskId,
          type: entry.caseId ? "case" : "task",
          projectTitle: entry.projectTitle,
          entries: [],
          totalDuration: 0,
        };
      }
      groups[groupKey].entries.push(entry);
      groups[groupKey].totalDuration += getDurationNumber(entry);
      return groups;
    }, {}),
  );

  console.log(groupedByProject);

  return (
    <div className="time-keeper-list">
      {showEntryView ? (
        <WidgetEntryView
          entry={entry}
          setEntry={setEntry}
          setShowEntryView={setShowEntryView}
          getEntries={getEntries}
        />
      ) : (
        <>
          <div className="time-keeper-list-head">
            <p></p>
            <p>Project</p>
            <p>Description</p>
            <p>Duration</p>
            <p>Date</p>
          </div>
          {groupedByProject?.length > 0 ? (
            groupedByProject.map((group) => (
              <TimeKeeperListGroup
                group={group}
                entry={entry}
                setEntry={setEntry}
                showEntryView={showEntryView}
                setShowEntryView={setShowEntryView}
                userId={userStore.userId}
              />
            ))
          ) : (
            <div className="no-entries">
              <i className="fa-solid fa-magnifying-glass"></i>
              <p>No entries available for the current selected range.</p>
              <p>
                Try changing the date range or filters to see existing entries.
              </p>
            </div>
          )}
          {/* {data?.length > 0 ? (
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
                  <p>{formatDateNoTime(entry.startTime)}</p>
                </div>
              );
            })
          ) : (
            <div className="no-entries">
              <i className="fa-solid fa-magnifying-glass"></i>
              <p>No entries available for the current selected range.</p>
              <p>
                Try changing the date range or filters to see existing entries.
              </p>
            </div>
          )} */}
        </>
      )}
    </div>
  );
};
export default TimeKeeperList;
