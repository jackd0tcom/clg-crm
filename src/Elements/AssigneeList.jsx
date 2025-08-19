import AssigneeToggle from "./AssigneeToggle";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AssigneeAddToggle from "./AssigneeAddToggle";

const AssigneeList = ({ assignees, caseId, taskId, onActivityUpdate }) => {
  const [assigneeList, setAssigneeList] = useState([]);
  const [nonAssigneeList, setNonAssigneeList] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setAssigneeList(assignees || []);
    try {
      axios.get(`/api/getCaseNonAssignees/${caseId}`).then((res) => {
        if ((res.status = 200)) {
          setNonAssigneeList(res.data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, [assignees]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdding(false);
      }
    };
    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]);

  const handleRemove = ({ caseId, userId }) => {
    try {
      console.log(caseId, userId);
      axios
        .delete("/api/removeCaseAssignees", {
          data: { caseId, userId },
        })
        .then((res) => {
          if (res.status === 200) {
            const removedUser = assigneeList.find(
              (user) => user.userId === userId
            );

            setAssigneeList((prevList) =>
              prevList.filter((nee) => nee.userId !== userId)
            );

            if (removedUser) {
              setNonAssigneeList((prevList) => [...prevList, removedUser]);
            }
            if (onActivityUpdate) {
              onActivityUpdate();
            }
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleAdd = ({ caseId, userId }) => {
    try {
      console.log(caseId, userId);
      axios
        .post("/api/addCaseAssignees", { caseId, userId })
        .then((res) => {
          if (res.status === 201) {
            setAssigneeList((prevList) => [...prevList, res.data]);
            setNonAssigneeList((prevList) =>
              prevList.filter((user) => user.userId !== userId)
            );
            setIsAdding(false);

            // Refresh activity data to show new activity
            if (onActivityUpdate) {
              onActivityUpdate();
            }
          }
        })
        .catch((error) => {
          if (error.response?.status === 409) {
            console.log("User is already assigned to this case");
          } else {
            console.log("Error adding assignee:", error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="assignee-list-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {assigneeList.map((nee) => {
        return (
          <AssigneeToggle
            assignee={nee}
            key={nee.userId}
            handleRemove={handleRemove}
            caseId={caseId}
            handleAdd={handleAdd}
          />
        );
      })}
      <div className="assignee-add-container" ref={dropdownRef}>
        {!isAdding && (
          <div
            className="assignee-toggle-add-wrapper"
            onClick={() => {
              setIsHovered(false);
              setIsAdding(true);
            }}
          >
            <i className="fa-solid fa-circle-plus assignee-toggle-add"></i>
          </div>
        )}
        {isAdding && (
          <AssigneeAddToggle
            nonAssigneeList={nonAssigneeList}
            setNonAssigneeList={setAssigneeList}
            handleAdd={handleAdd}
            setIsAdding={setIsAdding}
            caseId={caseId}
          />
        )}
      </div>
    </div>
  );
};
export default AssigneeList;
