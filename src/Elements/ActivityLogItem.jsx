import { formatRelativeTime } from "../helpers/helperFunctions";

const ActivityLogItem = ({ data }) => {
  return (
    <div className="activity-log-item-wrapper">
      <p className="activity-log-item-p">
        <i className="fa-solid fa-circle activity-log-dot"></i>
        {data.author.firstName} {data.author.lastName} {data.details}
      </p>
      <p className="activity-log-item-p">{formatRelativeTime(data.createdAt)}</p>
    </div>
  );
};

export default ActivityLogItem;
