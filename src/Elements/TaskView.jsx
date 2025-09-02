import { useState, useEffect, useRef } from "react";
import Loader from "./Loader";
import axios from "axios";
import ActivityLog from "./ActivityLog";
import TaskInput from "./TaskInput";
import { useNavigate } from "react-router";
import AssigneeList from "./AssigneeList";
import DueDatePicker from "./DueDatePicker";
import StatusToggle from "./StatusToggle";
import PriorityToggle from "./PriorityToggle";

const TaskView = ({ taskId, isOpen, onClose, onTaskUpdate }) => {
  const [taskData, setTaskData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState();
  const [priority, setPriority] = useState();
  const [status, setStatus] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && taskId) {
      async function fetch() {
        try {
          setIsLoading(true);
          await axios.get(`/api/getTask/${taskId}`).then((res) => {
            setTaskData(res.data);
            setTitle(res.data.title);
            setIsLoading(false);
            setStatus(res.data.status);
            setPriority(res.data.priority);
          });
        } catch (error) {
          console.log(error);
          setIsLoading(false);
        }
      }
      fetch();
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
        console.log("refreshed task data");
        setTaskData(res.data);
        setTitle(res.data.title);
        setIsLoading(false);
        setStatus(res.data.status);
        setPriority(res.data.priority);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const refreshTaskActivityData = async () => {
    try {
      await axios.get(`/api/getTask/${taskId}`).then((res) => {
        console.log("refreshed task data");
        setTaskData(res.data);
        setTitle(res.data.title);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (stat) => {
    try {
      console.log("updating status");
      await axios.post("/api/updateTask", {
        fieldName: "status",
        value: stat,
        taskId: taskData.taskId,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const updatePriority = async (stat) => {
    try {
      await axios.post("/api/updateTask", {
        fieldName: "priority",
        value: stat,
        taskId: taskData.taskId,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="task-view-overlay">
      <div className="nav-placeholder"></div>
      <div className="task-view-wrapper" ref={modalRef}>
        {isLoading ? (
          <Loader />
        ) : taskData ? (
          <>
            <div className="task-view-details">
              <a
                onClick={() => {
                  navigate(`/case/${taskData.caseId}`);
                  handleClose();
                }}
              >
                {taskData.case.title}
              </a>
              <TaskInput
                title={title}
                setTitle={setTitle}
                taskId={taskData.taskId}
              />
              <div className="task-stats-wrapper">
                <div className="task-stats-container">
                  <h4>Status</h4>
                  <h4>Assignees</h4>
                  <h4>Due Date</h4>
                  <h4>Priority</h4>
                </div>
                <div className="task-stats-container">
                  <StatusToggle
                    value={status}
                    setStatus={setStatus}
                    onHandle={updateStatus}
                  />
                  <AssigneeList
                    assignees={taskData.assignees}
                    taskId={taskData.taskId}
                  />
                  <DueDatePicker
                    currentDate={taskData.dueDate}
                    taskId={taskId}
                    refreshTaskData={refreshTaskData}
                    refreshTaskActivityData={refreshTaskActivityData}
                  />
                  <PriorityToggle
                    value={priority}
                    setPriority={setPriority}
                    onHandle={updatePriority}
                  />
                </div>
              </div>
            </div>
            <div className="task-view-activity-wrapper">
              <h2>Activity</h2>
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
