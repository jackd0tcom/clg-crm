import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusToggle from "./StatusToggle";
import { useState, useEffect } from "react";
import axios from "axios";
import AssigneeList from "./AssigneeList";
import AssigneeToggle from "./AssigneeToggle";

const TaskItem = ({ task, headings }) => {
  const [status, setStatus] = useState(task.status);
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    if (task.assignees) {
      setAssignees(task.assignees);
    }
  }, [task.assignees]);

  const newTask = Object.fromEntries(
    headings.map((heading) => {
      if (heading === "Case") {
        return [heading, task.case?.title || "No Case"];
      }
      if (heading === "Due Date") {
        return [
          heading,
          task.dueDate ? formatDateNoTime(task.dueDate) : "No Due Date",
        ];
      }
      if (heading === "Assignees") {
        return [heading, assignees.length > 0 ? `${assignees.length}` : "0"];
      }
      if (heading === "Owner") {
        return [
          heading,
          task.owner
            ? `${task.owner.firstName} ${task.owner.lastName}`
            : "Unknown",
        ];
      }
      if (heading === "Status") {
        return [heading, status]; // Use the state value for status
      }
      // For other fields, try to get from task object
      const fieldName = heading.toLowerCase().replace(/\s+/g, "");
      return [heading, task[fieldName] || "N/A"];
    })
  );

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
      {Object.entries(newTask).map(([key, value], index) =>
        key !== "Assignees" ? (
          <p key={index}>{value}</p>
        ) : (
          <div className="task-list-assignee-wrapper">
            {assignees.map((nee) => {
              return <AssigneeToggle assignee={nee} isStatic={true} />;
            })}
          </div>
        )
      )}
    </div>
  );
};

export default TaskItem;
