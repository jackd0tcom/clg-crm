import AssigneeToggle from "./AssigneeToggle";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

const AssigneeList = ({ assignees, caseId, taskId }) => {
  const [assigneeList, setAssigneeList] = useState([]);
  useEffect(() => {
    setAssigneeList(assignees || []);
  }, [assignees]);

  const handleRemove = ({ caseId, userId }) => {
    try {
      console.log(caseId, userId);
      axios
        .delete("/api/removeCaseAssignees", {
          data: { caseId, userId },
        })
        .then((res) => {
          if (res.status === 200) {
            setAssigneeList((prevList) =>
              prevList.filter((nee) => nee.userId !== userId)
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="assignee-list-wrapper">
      {assigneeList.map((nee) => {
        return (
          <AssigneeToggle
            assignee={nee}
            key={nee.userId}
            handleRemove={handleRemove}
            caseId={caseId}
          />
        );
      })}
    </div>
  );
};
export default AssigneeList;
