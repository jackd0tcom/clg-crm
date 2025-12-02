import { useState, useEffect } from "react";
import ProfilePic from "../UI/ProfilePic";

const AssigneeToggle = ({ assignee, handleRemove, Id, isStatic }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="assignee-toggle-wrapper"
      onMouseEnter={() => !isStatic && setIsHovered(true)}
      onMouseLeave={() => !isStatic && setIsHovered(false)}
    >
      {isHovered && (
        <i
          onClick={() => handleRemove({ Id, userId: assignee.userId })}
          className="fa-solid fa-circle-xmark assignee-toggle-x"
        ></i>
      )}
      <ProfilePic
        src={assignee.profilePic}
        alt={assignee.firstName}
        size="small"
        className="assignee-toggle-photo"
      />
      {isHovered && (
        <div className="assignee-toggle-name">{assignee.firstName}</div>
      )}
    </div>
  );
};
export default AssigneeToggle;
