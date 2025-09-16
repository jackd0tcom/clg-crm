import AssigneeToggle from "./AssigneeToggle";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AssigneeAddToggle from "./AssigneeAddToggle";

const AssigneeList = ({
  assignees,
  caseId,
  taskId,
  onActivityUpdate,
  refreshTaskActivityData,
  isNewCase,
  onTaskUpdate,
}) => {
  const [assigneeList, setAssigneeList] = useState([]);
  const [nonAssigneeList, setNonAssigneeList] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setAssigneeList(assignees || []);

    if (taskId && taskId !== 0) {
      try {
        axios.get(`/api/getTaskNonAssignees/${taskId}`).then((res) => {
          if (res.status === 200) {
            setNonAssigneeList(res.data);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (caseId && caseId !== 0 && !isNewCase) {
      try {
        axios.get(`/api/getCaseNonAssignees/${caseId}`).then((res) => {
          if (res.status === 200) {
            setNonAssigneeList(res.data);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [assignees, caseId, isNewCase]);

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

  const handleRemove = ({ Id, userId }) => {
    try {
      if (taskId && taskId !== 0) {
        axios
          .delete("/api/removeTaskAssignees", { data: { taskId: Id, userId } })
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
              if (onTaskUpdate) {
                onTaskUpdate();
              }
              refreshTaskActivityData();
            }
          });
      } else console.log(Id, userId);
      axios
        .delete("/api/removeCaseAssignees", {
          data: { caseId: Id, userId },
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
            if (onTaskUpdate) {
              onTaskUpdate();
            }
            refreshTaskActivityData();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleAdd = ({ Id, userId }) => {
    try {
      if (taskId && taskId !== 0) {
        axios
          .post("/api/addTaskAssignees", { taskId: Id, userId })
          .then((res) => {
            if (res.status === 201) {
              setAssigneeList((prevList) => [...prevList, res.data]);
              setNonAssigneeList((prevList) =>
                prevList.filter((user) => user.userId !== userId)
              );
              setIsAdding(false);
              refreshTaskActivityData();

              if (onActivityUpdate) {
                onActivityUpdate();
              }
              if (onTaskUpdate) {
                onTaskUpdate();
              }
            }
          });
      } else
        axios
          .post("/api/addCaseAssignees", { caseId: Id, userId })
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
              if (onTaskUpdate) {
                onTaskUpdate();
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

  if (isNewCase) {
    return (
      <div className="assignee-list-wrapper">
        <div className="new-case-assignee-placeholder">
          <p>Empty</p>
        </div>
        <div className="assignee-add-container" ref={dropdownRef}>
          <div
            className="assignee-toggle-add-wrapper-new"
            onClick={() => {
              setIsHovered(false);
              setIsAdding(true);
            }}
          >
            <i className="fa-solid fa-circle-plus assignee-toggle-add"></i>
          </div>
          {isAdding && (
            <AssigneeAddToggle
              nonAssigneeList={nonAssigneeList}
              setNonAssigneeList={setNonAssigneeList}
              handleAdd={handleAdd}
              setIsAdding={setIsAdding}
              Id={caseId || taskId}
            />
          )}
        </div>
      </div>
    );
  }

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
            Id={caseId || taskId}
            handleAdd={handleAdd}
          />
        );
      })}
      <div className="assignee-add-container" ref={dropdownRef}>
        <div
          className="assignee-toggle-add-wrapper"
          onClick={() => {
            setIsHovered(false);
            setIsAdding(true);
          }}
        >
          <i className="fa-solid fa-circle-plus assignee-toggle-add"></i>
        </div>
        {isAdding && (
          <AssigneeAddToggle
            nonAssigneeList={nonAssigneeList}
            setNonAssigneeList={setNonAssigneeList}
            handleAdd={handleAdd}
            setIsAdding={setIsAdding}
            Id={caseId || taskId}
          />
        )}
      </div>
    </div>
  );
};
export default AssigneeList;
