import { formatRelativeTime } from "../../helpers/helperFunctions";
import { useEffect } from "react";

const ActivityLogItem = ({ data, user }) => {
  let name = user.firstName + " " + user.lastName;
  let userName = data.author.firstName + " " + data.author.lastName;
  let details = data.details;
  let newString = "";

  if (userName === name) {
    userName = "You";
    if (details.includes(name)) {
      newString = details.replace(name, "yourself");
    }
  } else if (details.includes(name + " ")) {
    newString = details.replace(name, "you");
  }

  return (
    <div className="activity-log-item-wrapper">
      <p className="activity-log-item-p">
        <i className="fa-solid fa-circle activity-log-dot"></i>
        {userName} {newString ? newString : details}
      </p>
      <p className="activity-log-item-p">
        {formatRelativeTime(data.createdAt)}
      </p>
    </div>
  );
};

export default ActivityLogItem;
