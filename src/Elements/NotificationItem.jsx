import { useAuth0 } from "@auth0/auth0-react";
import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusIcon from "./StatusIcon";
import { useState } from "react";
import { useNavigate } from "react-router";

const NotificationItem = ({
  data,
  handleRead,
  handleCleared,
  openTaskView,
}) => {
  const [hover, setHover] = useState(false);
  const nav = useNavigate();

  const handleClick = (e) => {
    handleRead(data);
    if (data.case) {
      nav(`/case/${data.case.caseId}`);
    } else openTaskView(data.task);
  };

  return (
    <div
      className={
        !data.isRead
          ? `notification-item-wrapper`
          : `notification-item-wrapper read`
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="notification-item-span" onClick={() => handleClick()}>
        <div className="notification-task-wrapper">
          {data.task && (
            <StatusIcon
              status={data.task.status}
              hasIcon={true}
              hasTitle={false}
              noBg={true}
            />
          )}
          {!data.task && <i className="fa-solid fa-briefcase"></i>}
          <p>{data.case ? data.case.title : data.task.title}</p>
        </div>
        <p>{data.message}</p>
      </span>
      <span>
        {!data.isCleared && hover ? (
          <button
            className="clear-notification"
            onClick={() => handleCleared(data)}
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
