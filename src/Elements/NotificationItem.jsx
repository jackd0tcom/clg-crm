import { useAuth0 } from "@auth0/auth0-react";
import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusIcon from "./StatusIcon";
import { useState } from "react";

const NotificationItem = ({ data, handleRead, openTaskView }) => {
  const [hover, setHover] = useState(false);

  const handleClick = (e) => {
    if (openTaskView) {
      openTaskView(data.task.taskId);
    }
  };

  return (
    <div
      className="notification-item-wrapper"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="notification-item-span" onClick={() => handleClick()}>
        <p className="notification-task-wrapper">
          {
            <StatusIcon
              status={data.task.status}
              hasIcon={true}
              hasTitle={false}
              noBg={true}
            />
          }
          {data.task.title}
        </p>
        <p>{data.message}</p>
      </span>
      <span>
        {!data.isRead && hover ? (
          <button
            className="clear-notification"
            onClick={() => handleRead(data.notificationId)}
          >
            <i className="fa-solid fa-check"></i>
            Clear
          </button>
        ) : (
          <p>{formatDateNoTime(data.updatedAt)}</p>
        )}
      </span>
    </div>
  );
};
export default NotificationItem;
