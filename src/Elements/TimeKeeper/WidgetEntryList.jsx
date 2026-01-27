import { useEffect, useState } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";

const WidgetEntryList = () => {
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/time-entry/getRecentUserEntries").then((res) => {
          if (res.statusText === "OK") {
            setRecentEntries(res.data);
            console.log(res.data);
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
  }, []);

  const getDuration = (entry) => {
    const timeDifference =
      Math.floor(new Date(entry.endTime).getTime() / 1000) -
      Math.floor(new Date(entry.startTime).getTime() / 1000);
    const hours = Math.floor(timeDifference / 3600);
    const minutes = Math.floor((timeDifference % 3600) / 60);
    const seconds = Math.floor((timeDifference % 3600) % 60);

    return `${hours > 0 ? hours : "0"}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="widget-entry-list-wrapper">
      {recentEntries?.length > 0 &&
        recentEntries.map((entry) => {
          return (
            <div className="widget-entry-item" key={entry.timeEntryId}>
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
                {/* TODO this dang ol thing */}
                <i id="time-entry-start" className="fa-solid fa-play"></i>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default WidgetEntryList;
