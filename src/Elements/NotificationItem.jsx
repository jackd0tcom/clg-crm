import { useAuth0 } from "@auth0/auth0-react";
import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusIcon from "./StatusIcon";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const NotificationItem = ({
  data,
  handleRead,
  handleCleared,
  openTaskView,
}) => {
  const [hover, setHover] = useState(false);
  const nav = useNavigate();
  const [isTask, setIsTask] = useState(false);

  useEffect(() => {
    if (data.objectType === "task") {
      setIsTask(true);
    }
  }, [data.objectType]);

  const handleClick = (e) => {
    handleRead(data);
    if (!isTask && data.case) {
      nav(`/case/${data.case.caseId}`);
    } else if (isTask && data.task) {
      openTaskView(data.task);
    }
  };

  if (!data || (!data.case && !data.task)) {
    return null;
  }

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
      <div className="notification-item-span" onClick={() => handleClick()}>
        <div className="notification-task-wrapper">
          {isTask && data.task && (
            <StatusIcon
              status={data.task.status}
              hasIcon={true}
              hasTitle={false}
              noBg={true}
            />
          )}
          {!isTask && <i className="fa-solid fa-briefcase case-icon"></i>}
          <p className="notification-item-title">
            {!isTask ? (data.case?.title || "") : (data.task?.title || "")}
          </p>
        </div>
        <p>{data.message}</p>
      </div>
      <div className="notification-item-button-wrapper">
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
      </div>
    </div>
  );
};
export default NotificationItem;
