import ActivityLogItem from "./ActivityLogItem";
import { useState, useEffect } from "react";

const ActivityLog = ({ data }) => {
  const [showAll, setShowAll] = useState(true);
  const [shortList, setShortList] = useState();

  useEffect(() => {
    if (data.length > 8) {
      setShowAll(false);
      setShortList(data.slice(0, 7));
    }
  }, [data]);

  return (
    <div className="activity-log-wrapper">
      <h2>Activity</h2>
      <div className="activity-log-items">
        {!shortList
          ? data.map((act) => {
              return <ActivityLogItem key={act.activityId} data={act} />;
            })
          : showAll
          ? data.map((act) => {
              return <ActivityLogItem key={act.activityId} data={act} />;
            })
          : shortList.map((act) => {
              return <ActivityLogItem key={act.activityId} data={act} />;
            })}

        <div
          onClick={() => {
            if (!showAll) {
              setShowAll(true);
            } else setShowAll(false);
          }}
          className="activity-show-wrapper"
        >
          {shortList && <p>{!showAll ? "See All Activity" : "See Less"}</p>}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
