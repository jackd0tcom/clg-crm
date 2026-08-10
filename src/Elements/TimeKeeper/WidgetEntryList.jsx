import { useEffect, useState } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import { getDuration, formatDay } from "../../helpers/helperFunctions";
import { formatDollarNoCents } from "../../helpers/helperFunctions";

const WidgetEntryList = ({
  entry,
  setEntry,
  startTimer,
  setShowEntryView,
  entriesRefreshKey,
  entryServices,
  setShowChargeView,
  setCharge,
}) => {
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentCharges, setRecentCharges] = useState([]);

  const getServiceTitle = (id) => {
    return (
      entryServices?.find((service) => service.entryServiceId === id)
        ?.serviceTitle ?? ""
    );
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/time-entry/getRecentUserEntries").then((res) => {
          if (res.status === 200) {
            setRecentEntries(
              res.data.entries.filter((entry) => entry !== null),
            );
            setRecentCharges(res.data.charges);
          } else {
            console.log(res);
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
    recentCharges?.forEach((charge) => {
      const day = charge.createdAt
        ? new Date(charge.createdAt).toISOString().split("T")[0]
        : null;
      charge.projectTitle = charge.case.title ?? "";
      if (day) {
        if (!groups[day]) groups[day] = [];
        groups[day].push(charge);
      }
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, entries]) => {
        const sortedEntries = entries.sort(
          (a, b) =>
            new Date(b.startTime ? b.startTime : b.createdAt).getTime() -
            new Date(a.startTime ? a.startTime : a.createdAt).getTime(),
        );
        return { day, entries: sortedEntries };
      });
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
          const dailySeconds = entries?.reduce((acc, entry) => {
            let duration = 0;
            if (!entry.chargeId) {
              duration = getDurationNumber(entry);
            }
            return acc + duration;
          }, 0);
          return (
            <div key={day} className="widget-entry-group">
              <div className="widget-entry-day">
                <p>{formatDay(day)}</p>
                <p>{formatDailyDuration(dailySeconds)}</p>
              </div>
              {entries?.length > 0 ? (
                entries?.map((entry) => (
                  <div
                    onClick={() => {
                      if (entry.chargeId) {
                        setCharge({
                          chargeId: entry.chargeId,
                          description: entry.description,
                          amount: entry.amount,
                        });
                        setShowChargeView(true);
                      } else {
                        setEntry({
                          ...entry,
                          currentTitle: entry.projectTitle,
                          endTime: entry.endTime,
                        });
                        setShowEntryView(true);
                      }
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
                        {entry.chargeId
                          ? entry.description
                          : (getServiceTitle(entry.entryServiceId) ??
                            "Add a Description")}
                      </p>
                      <p>
                        {entry.chargeId
                          ? formatDollarNoCents(entry.amount)
                          : getDuration(entry)}
                      </p>
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
                    </div>
                  </div>
                ))
              ) : (
                <div className="widget-entry-item">
                  <p>No entries yet!</p>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
export default WidgetEntryList;
