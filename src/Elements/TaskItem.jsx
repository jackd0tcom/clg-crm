import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";
import StatusToggle from "./StatusToggle";
import { useState, useEffect } from "react";
import axios from "axios";
import AssigneeList from "./AssigneeList";
import AssigneeToggle from "./AssigneeToggle";
import TaskInput from "./TaskInput";
import PriorityIcon from "./PriorityIcon";
import StatusIcon from "./StatusIcon";
import { findTimeDifference } from "../helpers/helperFunctions";

const TaskItem = ({
  task,
  headings,
  openTaskView,
  newTask,
  setNewTask,
  refreshTasks,
  date,
  caseId,
  refreshCaseData,
  refreshActivityData,
  columns,
}) => {
  const [status, setStatus] = useState(task.status);
  const [assignees, setAssignees] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [taskId, setTaskId] = useState();
  const [hasIcon, setHasIcon] = useState(false);

  useEffect(() => {
    if (!newTask) {
      setTaskId(task.taskId);
    }
    if (task.assignees) {
      setAssignees(task.assignees);
    }
    // Update local status when task status changes
    if (task.status) {
      setStatus(task.status);
    }
  }, [task.assignees, task.status, task.taskId]);

  useEffect(() => {
    if (headings.includes("Status")) {
      setHasIcon(true);
    }
  }, []);

  const newTaskObj = Object.fromEntries(
    headings.map((heading) => {
      if (heading === "Case") {
        return [heading, task.case?.title || ""];
      }
      if (heading === "Due Date") {
        return [
          heading,
          task.dueDate ? findTimeDifference(task.dueDate).slice(1) : "",
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
      if (heading === "Priority") {
        return [heading, task.priority || "normal"]; // Handle priority specifically
      }
      // For other fields, try to get from task object
      const fieldName = heading.toLowerCase().replace(/\s+/g, "");
      return [heading, task[fieldName] || "N/A"];
    })
  );

  const handleStatusChange = (newStatus) => {
    try {
      axios
        .post("/api/updateTaskStatus", {
          taskId: task.taskId,
          status: newStatus,
        })
        .then((res) => {
          setStatus(newStatus);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="task-list-item"
      style={{ gridTemplateColumns: `${newTask ? "1fr 1fr 1fr" : columns}` }}
      onClick={() => {
        !newTask && openTaskView(task);
      }}
    >
      {newTask ? (
        <div className="new-task-item-wrapper">
          <TaskInput
            newTask={newTask}
            setNewTask={setNewTask}
            setTaskId={setTaskId}
            title={newTitle}
            setTitle={setNewTitle}
            refreshTasks={refreshTasks}
            openTaskView={openTaskView}
            date={date}
            caseId={caseId}
            refreshCaseData={refreshCaseData}
            refreshActivityData={refreshActivityData}
          />
        </div>
      ) : (
        Object.entries(newTaskObj).map(([key, value], index) =>
          key === "Assignees" ? (
            <div key={index} className="task-list-assignee-wrapper">
              {assignees.map((nee) => {
                return (
                  <AssigneeToggle
                    key={`user-${nee.userId}`}
                    assignee={nee}
                    isStatic={true}
                  />
                );
              })}
            </div>
          ) : key === "Priority" ? (
            <PriorityIcon key={index} data={value} />
          ) : key === "Status" ? (
            <StatusIcon
              key={`${task.taskId}-status-${value}`}
              status={value}
              hasIcon={true}
              hasTitle={false}
              noBg={true}
            />
          ) : (
            <p key={index}>{capitalize(value)}</p>
          )
        )
      )}
    </div>
  );
};

export default TaskItem;
