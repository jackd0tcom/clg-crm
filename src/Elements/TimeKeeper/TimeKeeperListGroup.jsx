import StatusIcon from "../Task/StatusIcon";
import { useState } from "react";
import {
  formatTimeFromSeconds,
  getDuration,
  formatDateNoTime,
} from "../../helpers/helperFunctions";
import ProfilePic from "../UI/ProfilePic";
import TimeEntryStatusBadge from "../UI/TimeEntryStatusBadge";

const TimeKeeperListGroup = ({
  group,
  setEntry,
  showEntryView,
  setShowEntryView,
  userId,
}) => {
  const [showEntries, setShowEntries] = useState(false);
  const includedUsers = [];

  group.entries.forEach((entry) => {
    const user = entry.user;
    if (!includedUsers.some((us) => us.userId === user.userId)) {
      includedUsers.push(user);
    }
  });

  return (
    <div className="time-keeper-list-group-wrapper">
      <div
        className="list-group-project-item"
        onClick={() => setShowEntries(!showEntries)}
      >
        <i
          onClick={() => setShowEntries(!showEntries)}
          className={
            showEntries
              ? "fa-solid fa-angle-right list-group-toggle show-entries"
              : "fa-solid fa-angle-right list-group-toggle"
          }
        ></i>
        <div className="entry-group-users-wrapper">
          {includedUsers.map((user) => (
            <ProfilePic src={user.profilePic} />
          ))}
        </div>
        <div className="group-title">
          {group.type === "task" ? (
            <StatusIcon
              status={group.entries[0].status}
              hasIcon={true}
              hasTitle={false}
              noBg={true}
            />
          ) : (
            <i className="fa-solid fa-briefcase group-title-case"></i>
          )}
          <span className="group-entries">{`(${group.entries.length})`}</span>
          {group.projectTitle}
        </div>
        <p></p>
        <p>{formatTimeFromSeconds(group.totalDuration)}</p>
      </div>
      <div
        className={
          showEntries
            ? "time-keeper-entry-list-wrapper list-open"
            : "time-keeper-entry-list-wrapper"
        }
      >
        {showEntries &&
          group.entries.map((entry) => (
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
                  userId: userId,
                  status: entry.status || null,
                });
                showEntryView
                  ? setShowEntryView(false)
                  : setShowEntryView(true);
              }}
            >
              <p></p>
              <ProfilePic src={entry.user.profilePic} />
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
              <TimeEntryStatusBadge status={entry.paidStatus} />
            </div>
          ))}
      </div>
    </div>
  );
};
export default TimeKeeperListGroup;
