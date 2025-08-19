import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusToggle from "./StatusToggle";
import { useState } from "react";
import axios from "axios";

const TaskItem = ({ task }) => {
  const [status, setStatus] = useState(task.status);

  const handleStatusChange = (newStatus) => {
    try {
      console.log(newStatus);
      axios
        .post("/api/updateTaskStatus", {
          taskId: task.taskId,
          status: newStatus,
        })
        .then((res) => {
          console.log(res.data);
          setStatus(newStatus);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="task-list-item">
      <p className="task-title-td">{task.title}</p>
      <StatusToggle
        value={status}
        onHandle={handleStatusChange}
        setStatus={setStatus}
      />
      <div className="task-item-assignee-photo-wrapper">
        {task.assignees.map((nee) => {
          return (
            <div
              className="task-item-assignee-photo"
              style={{ backgroundImage: `url(${nee.profilePic})` }}
              key={nee.taskId}
            ></div>
          );
        })}
      </div>
      <p>{formatDateNoTime(task.dueDate)}</p>
    </div>
  );
};

export default TaskItem;
