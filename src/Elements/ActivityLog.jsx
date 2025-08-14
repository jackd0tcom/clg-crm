import ActivityLogItem from "./ActivityLogItem";

const ActivityLog = ({ data }) => {
  return (
    <div className="activity-log-wrapper">
      <h2>Activity</h2>
      <div className="activity-log-items">
        {data.map((act) => {
          return <ActivityLogItem key={act.activityId} data={act} />;
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
