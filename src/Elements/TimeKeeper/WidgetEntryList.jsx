import { useEffect, useState } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import { getDuration, formatDay } from "../../helpers/helperFunctions";

const WidgetEntryList = ({ entry, setEntry, startTimer, setShowEntryView, entriesRefreshKey }) => {
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/time-entry/getRecentUserEntries").then((res) => {
          if (res.statusText === "OK") {
            setRecentEntries(res.data);
          } else {
            console.log(error);
            setRecentEntries([{}]);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, [entriesRefreshKey]);

  const groupByDay = () => {
    const groups = {};
    for (const entry of recentEntries) {
      const day = entry.startTime
        ? new Date(entry.startTime).toISOString().split("T")[0]
        : null;
      if (day) {
        if (!groups[day]) groups[day] = [];
        groups[day].push(entry);
      }
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, entries]) => ({ day, entries }));
  };

  const getDurationNumber = (entry) => {
    const timeDifference =
      Math.floor(new Date(entry.endTime).getTime() / 1000) -
      Math.floor(new Date(entry.startTime).getTime() / 1000);

    return timeDifference;
  };

  const formatDailyDuration = (dailySeconds) => {
    const hours = Math.floor(dailySeconds / 3600);
    const minutes = Math.floor((dailySeconds % 3600) / 60);
    const seconds = Math.floor((dailySeconds % 3600) % 60);
    return `${hours > 0 ? hours : "0"}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePressPlay = (entry) => {
    const override = {
      caseId: entry.caseId,
      taskId: entry.taskId,
      notes: entry.notes,
      currentTitle: entry.projectTitle,
    };
    startTimer(override);
  };

  const groupedEntries = groupByDay();

  return (
    <div className="widget-entry-list-wrapper">
      {recentEntries?.length > 0 &&
        groupedEntries.map(({ day, entries }) => {
          const dailySeconds = entries.reduce(
            (acc, entry) => acc + getDurationNumber(entry),
            0,
          );
          return (
            <div key={day} className="widget-entry-group">
              <div className="widget-entry-day">
                <p>{formatDay(day)}</p>
                <p>{formatDailyDuration(dailySeconds)}</p>
              </div>
              {entries.map((entry) => (
                <div
                  onClick={() => {
                    setEntry({
                      ...entry,
                      currentTitle: entry.projectTitle,
                      endTime: entry.endTime,
                    });
                    setShowEntryView(true);
                  }}
                  className="widget-entry-item"
                  key={entry.timeEntryId}
                >
                  <div className="widget-entry-item-top">
                    <p
                      className={
                        entry.notes
                          ? "widget-entry-item-notes"
                          : "widget-entry-item-notes no-notes"
                      }
                    >
                      {entry.notes ? entry.notes : "Add a Description"}
                    </p>
                    <p>{getDuration(entry)}</p>
                  </div>
                  <div className="widget-entry-item-bottom">
                    <div className="widget-entry-item-project">
                      {entry.caseId ? (
                        <i
                          id="entry-case-icon"
                          className="fa-solid fa-briefcase"
                        ></i>
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
                    <i
                      onClick={() => handlePressPlay(entry)}
                      id="time-entry-start"
                      className="fa-solid fa-play"
                    ></i>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );
};
export default WidgetEntryList;
