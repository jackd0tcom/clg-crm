import { useState, useEffect, useRef } from "react";
import Loader from "../UI/Loader";
import axios from "axios";
import ActivityLog from "../UI/ActivityLog";
import TaskInput from "./TaskInput";
import { useNavigate } from "react-router";
import AssigneeList from "../Assignee/AssigneeList";
import DueDatePicker from "./DueDatePicker";
import StatusToggle from "./StatusToggle";
import PriorityToggle from "./PriorityToggle";
import Notes from "../UI/Notes";
import ExtraSettings from "../UI/ExtraSettings";
import TaskCaseToggle from "./TaskCaseToggle";
import TimeKeeperWidget from "../TimeKeeper/TimeKeeperWidget";

const TaskView = ({ taskId, setTaskId, isOpen, onClose, onTaskUpdate }) => {
  const [taskData, setTaskData] = useState();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState();
  const [priority, setPriority] = useState();
  const [status, setStatus] = useState();
  const [notes, setNotes] = useState();
  const [count, setCount] = useState(0);
  const [isHoverMove, setIsHoverMove] = useState(false);
  const [isMovingCase, setIsMovingCase] = useState(false);
  const [currentCase, setCurrentCase] = useState();
  const [dueDate, setDueDate] = useState();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && taskId) {
      if (taskId === "new") {
        // Handle new task
        setTaskData({});
        setTitle("");
        setStatus("not started");
        setPriority("normal");
        setNotes("");
        setCurrentCase(null);
        setActivities([]);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow);
        setIsCreatingTask(false);
        setIsLoading(false);
      } else {
        // Handle existing task
        async function fetch() {
          try {
            setIsLoading(true);
            await axios.get(`/api/getTask/${taskId}`).then((res) => {
              setTaskData(res.data);
              setTitle(res.data.title);
              setIsLoading(false);
              setStatus(res.data.status);
              setPriority(res.data.priority);
              setNotes(res.data.notes);
              setCurrentCase(res.data.case);
              setDueDate(res.data.dueDate);
            });
            await axios.get(`/api/getTaskActivities/${taskId}`).then((res) => {
              setActivities(res.data);
            });
          } catch (error) {
            console.log(error);
            setIsLoading(false);
          }
        }
        fetch();
      }
    }
  }, [taskId, isOpen]);

  const modalRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onTaskUpdate) {
      onTaskUpdate();
    }
    onClose();
  };

  if (!isOpen) return null;

  const refreshTaskData = async () => {
    try {
      await axios.get(`/api/getTask/${taskId}`).then((res) => {
        setTaskData(res.data);
        setTitle(res.data.title);
        setIsLoading(false);
        setCurrentCase(res.data.case);
        setStatus(res.data.status);
        setPriority(res.data.priority);
        setNotes(res.data.notes);
        setDueDate(res.data.dueDate);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const refreshTaskActivityData = async () => {
    try {
      if (taskId && taskId !== "new") {
        await axios.get(`/api/getTaskActivities/${taskId}`).then((res) => {
          setActivities(res.data);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (stat) => {
    if (stat !== status) {
      try {
        await axios
          .post("/api/updateTask", {
            fieldName: "status",
            value: stat,
            taskId: taskData.taskId,
          })
          .then((res) => {
            setStatus(stat);
            refreshTaskActivityData();
            refreshTaskData();
            if (onTaskUpdate) {
              onTaskUpdate();
            }
          });
      } catch (error) {
        console.log(error);
      }
    } else return;
  };
  const updatePriority = async (stat) => {
    if (stat !== priority) {
      try {
        await axios
          .post("/api/updateTask", {
            fieldName: "priority",
            value: stat,
            taskId: taskData.taskId,
          })
          .then((res) => {
            setPriority(stat);
            refreshTaskActivityData();
            refreshTaskData();
            if (onTaskUpdate) {
              onTaskUpdate();
            }
          });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const updateNotes = async () => {
    try {
      await axios
        .post("/api/updateTask", {
          fieldName: "notes",
          value: notes,
          taskId: taskData.taskId,
        })
        .then((res) => {
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const createNewTask = async () => {
    if (isCreatingTask) return; // Prevent duplicate creation

    try {
      setIsCreatingTask(true);
      console.log("creating new task");
      await axios
        .post("/api/newTask", {
          title: title || "Untitled Task",
          notes: notes || "",
          caseId: currentCase?.caseId || null,
          dueDate: dueDate,
          priority: priority || "normal",
          status: status || "not_started",
        })
        .then((res) => {
          if (res.status === 201) {
            // Update the taskId to the newly created task
            setTaskId(res.data.taskId);
            setTaskData(res.data);
            // Fetch activities for the new task
            setTimeout(() => {
              refreshTaskActivityData();
            }, 100);
            // Refresh the parent component
            if (onTaskUpdate) {
              onTaskUpdate();
            }
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingTask(false);
    }
  };
  const handleUpdateNotes = (notes) => {
    setNotes(notes);
    if (count >= 75) {
      updateNotes();
    }
  };

  return (
    <div className="task-view-overlay">
      <div className="nav-placeholder"></div>
      <div className="task-view-wrapper" ref={modalRef}>
        {isLoading ? (
          <Loader />
        ) : taskId === "new" || taskData ? (
          <>
            <div className="task-view-details">
              <div className="task-view-header">
                <h3>Task</h3>
                <div className="task-view-header-container">
                  <TimeKeeperWidget taskId={taskId} title={title} />
                  <ExtraSettings
                    taskId={taskData?.taskId}
                    handleRefresh={refreshTaskData}
                    handleClose={handleClose}
                    onTaskUpdate={onTaskUpdate}
                  />
                </div>
              </div>
              <div
                onMouseEnter={() => setIsHoverMove(true)}
                onMouseLeave={() => setIsHoverMove(false)}
                className="task-view-case-wrapper"
              >
                <a
                  className="task-view-case-name"
                  onClick={() => {
                    if (taskData?.caseId) {
                      navigate(`/case/${taskData.caseId}`);
                      handleClose();
                    }
                  }}
                >
                  {currentCase ? currentCase.title : "Assign to Case"}
                </a>
                {isHoverMove && (
                  <div className="move-task-wrapper">
                    <i
                      onClick={() => setIsMovingCase(true)}
                      id="move-case-icon"
                      className="fa-solid fa-arrow-up-right-from-square"
                    ></i>
                  </div>
                )}
                {isMovingCase && (
                  <TaskCaseToggle
                    currentCase={currentCase}
                    setCurrentCase={setCurrentCase}
                    taskId={taskData?.taskId}
                    refreshTaskData={refreshTaskData}
                    refreshTaskActivityData={refreshTaskActivityData}
                    isMovingCase={isMovingCase}
                    setIsMovingCase={setIsMovingCase}
                  />
                )}
              </div>
              <TaskInput
                title={title}
                setTitle={setTitle}
                taskId={taskId === "new" ? null : taskData?.taskId}
                refreshTaskActivityData={refreshTaskActivityData}
                newTask={taskId === "new"}
                setNewTask={() => {}} // Not needed for TaskView
                setTaskId={(newTaskId) => setTaskId(newTaskId)}
                refreshTasks={onTaskUpdate}
                openTaskView={() => {}} // Not needed for TaskView
                createNewTask={createNewTask}
                isCreatingTask={isCreatingTask}
              />
              <div className="task-stats-wrapper">
                <div className="task-stats-item">
                  <h4>Status</h4>
                  <StatusToggle
                    value={status}
                    setStatus={setStatus}
                    onHandle={updateStatus}
                    status={status}
                  />
                </div>
                <div className="task-stats-item">
                  {" "}
                  <h4>Assignees</h4>
                  <AssigneeList
                    assignees={taskData?.assignees || []}
                    taskId={taskData?.taskId}
                    refreshTaskActivityData={refreshTaskActivityData}
                    onActivityUpdate={onTaskUpdate}
                  />
                </div>
                <div className="task-stats-item">
                  {" "}
                  <h4>Due Date</h4>
                  <DueDatePicker
                    currentDate={dueDate}
                    taskId={taskId === "new" ? null : taskId}
                    refreshTaskData={refreshTaskData}
                    refreshTaskActivityData={refreshTaskActivityData}
                    onTaskUpdate={onTaskUpdate}
                  />
                </div>
                <div className="task-stats-item">
                  {" "}
                  <h4>Priority</h4>
                  <PriorityToggle
                    value={priority}
                    setPriority={setPriority}
                    onHandle={updatePriority}
                  />
                </div>
              </div>
              <div className="task-notes">
                <Notes
                  value={notes}
                  setCount={setCount}
                  count={count}
                  onChange={handleUpdateNotes}
                  updateNotes={updateNotes}
                />
              </div>
            </div>
            <div className="task-view-activity-wrapper">
              <ActivityLog
                data={activities}
                objectId={taskId}
                objectType={"task"}
                refreshActivityData={refreshTaskActivityData}
              />
            </div>
          </>
        ) : (
          <p>Task not found</p>
        )}
      </div>
    </div>
  );
};

export default TaskView;
