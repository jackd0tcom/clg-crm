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
        // For tasks: Update UI immediately for instant feedback
        const removedUser = assigneeList.find((user) => user.userId === userId);

        setAssigneeList((prevList) =>
          prevList.filter((nee) => nee.userId !== userId)
        );

        if (removedUser) {
          setNonAssigneeList((prevList) => [...prevList, removedUser]);
        }

        // Trigger UI updates immediately
        if (onActivityUpdate) {
          onActivityUpdate();
        }
        if (onTaskUpdate) {
          onTaskUpdate();
        }
        if (taskId) {
          refreshTaskActivityData();
        }
      }

      // Make API call
      if (taskId && taskId !== 0) {
        // For tasks: make API call in background (don't wait for response)
        axios
          .delete("/api/removeTaskAssignees", { data: { taskId: Id, userId } })
          .catch((error) => {
            console.error("Failed to remove task assignee:", error);
          });
      } else {
        // For cases: wait for API response to ensure proper data
        const removedUser = assigneeList.find((user) => user.userId === userId);

        axios
          .delete("/api/removeCaseAssignees", {
            data: { caseId: Id, userId },
          })
          .then((res) => {
            if (res.status === 200) {
              // Update UI with the proper response data
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
              if (taskId) {
                refreshTaskActivityData();
              }
            }
          })
          .catch((error) => {
            console.error("Failed to remove case assignee:", error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleAdd = ({ Id, userId }) => {
    try {
      if (taskId && taskId !== 0) {
        // For tasks: Find the user being added from nonAssigneeList
        const userToAdd = nonAssigneeList.find(
          (user) => user.userId === userId
        );

        if (userToAdd) {
          // Update UI immediately for instant feedback
          setAssigneeList((prevList) => [...prevList, userToAdd]);
          setNonAssigneeList((prevList) =>
            prevList.filter((user) => user.userId !== userId)
          );
          setIsAdding(false);

          // Trigger UI updates immediately
          if (onActivityUpdate) {
            onActivityUpdate();
          }
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        }
      }

      // Make API call
      if (taskId && taskId !== 0) {
        // For tasks: make API call in background (don't wait for response)
        axios
          .post("/api/addTaskAssignees", { taskId: Id, userId })
          .then((res) => {
            if (res.status === 200) {
              refreshTaskActivityData();
            }
          })
          .catch((error) => {
            console.error("Failed to add task assignee:", error);
            if (error.response?.status === 409) {
              console.log("User is already assigned to this task");
            }
          });
      } else {
        // For cases: wait for API response to ensure proper data
        axios
          .post("/api/addCaseAssignees", { caseId: Id, userId })
          .then((res) => {
            if (res.status === 201) {
              // Update UI with the proper response data
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
            console.error("Failed to add case assignee:", error);
            if (error.response?.status === 409) {
              console.log("User is already assigned to this case");
            }
          });
      }
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
