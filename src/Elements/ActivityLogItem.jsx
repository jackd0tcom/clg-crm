import { formatDate } from "../helpers/helperFunctions";

const ActivityLogItem = ({ data }) => {
  return (
    <div className="activity-log-item-wrapper">
      <p className="activity-log-item-p">
        <i className="fa-solid fa-circle activity-log-dot"></i>
        <span className="activity-item-pic-span">
          <img
            className="activity-item-profile-pic"
            src={data.author.profilePic}
            alt=""
          />
        </span>
        {data.author.firstName} {data.author.lastName} {data.details}
      </p>
      <p className="activity-log-item-p">{formatDate(data.createdAt)}</p>
    </div>
  );
};

export default ActivityLogItem;
