import { useEffect } from "react";
const StatusIcon = ({ status, hasIcon, hasTitle, noBg }) => {
  const copy = {
    "not started": <p className="status-title not-started">Not Started</p>,
    "in progress": <p className="status-title in-progress">In Progress</p>,
    blocked: <p className="status-title blocked">Blocked</p>,
    completed: <p className="status-title completed">Completed</p>,
  };
  const icons = {
    "not started": (
      <i className="status-icon not-started fa-regular fa-circle"></i>
    ),
    "in progress": (
      <i className="status-icon in-progress fa-solid fa-circle-half-stroke"></i>
    ),
    blocked: <i className="status-icon blocked fa-regular fa-circle-xmark"></i>,
    completed: <i className="status-icon completed fa-solid fa-circle"></i>,
  };

  const className = {
    "not started": "not-started-wrapper",
    "in progress": "in-progress-wrapper",
    blocked: "blocked-wrapper",
    completed: "completed-wrapper",
  };

  return (
    <div
      className={`status-icon-wrapper ${
        !noBg ? className[status] : "colored-icons"
      }`}
    >
      {hasIcon && icons[status]}
      {hasTitle && copy[status]}
    </div>
  );
};
export default StatusIcon;
