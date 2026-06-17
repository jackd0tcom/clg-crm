import { useAuth0 } from "@auth0/auth0-react";
import { formatDateNoTime, capitalize } from "../../helpers/helperFunctions";
import StatusIcon from "../Task/StatusIcon";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import MentionPill from "../UI/MentionPill";

const NotificationItem = ({
  data,
  handleRead,
  handleCleared,
  openTaskView,
}) => {
  const [hover, setHover] = useState(false);
  const nav = useNavigate();
  const [isTask, setIsTask] = useState(false);
  const [message, setMessage] = useState(data.message);
  const user = useSelector((state) => state.user);

  const MENTION_RE = /\$:MENTION:(\w+):([^:]*):([^:]*):(\S*)/g;

  function renderCommentContent(content) {
    const parts = [];
    let last = 0;
    let m;
    while ((m = MENTION_RE.exec(content)) !== null) {
      if (m.index > last)
        parts.push({ type: "text", value: content.slice(last, m.index) });
      parts.push({
        // type: "mention",
        type: m[1],
        id: m[2],
        name: m[3],
        extra: m[4],
      });
      last = m.index + m[0].length;
    }
    if (last < content?.length)
      parts.push({ type: "text", value: content.slice(last) });
    return parts.map((part) =>
      part.type === "text" ? (
        <span className="notification-content-span">{part.value}</span>
      ) : (
        <MentionPill
          data={part}
          user={data.author}
          openTaskView={openTaskView}
        />
      ),
    );
  }

  useEffect(() => {
    const formatMessage = () => {
      let name = user.firstName + " " + user.lastName;

      if (message.includes(name + " ")) {
        setMessage(message.replace(name, "You"));
      }
    };
    formatMessage();
  }, []);

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
            {!isTask ? data.case?.title || "" : data.task?.title || ""}
          </p>
        </div>
        <div className="notification-item-content">
          {renderCommentContent(message)}
        </div>
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
