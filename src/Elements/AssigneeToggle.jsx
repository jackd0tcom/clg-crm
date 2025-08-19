import { useState } from "react";

const AssigneeToggle = ({ assignee, handleRemove, caseId }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="assignee-toggle-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <i
          onClick={() => handleRemove({ caseId, userId: assignee.userId })}
          className="fa-solid fa-circle-xmark assignee-toggle-x"
        ></i>
      )}
      <img className="assignee-toggle-photo" src={assignee.profilePic} alt="" />
      {isHovered && (
        <div className="assignee-toggle-name">{assignee.firstName}</div>
      )}
    </div>
  );
};
export default AssigneeToggle;
