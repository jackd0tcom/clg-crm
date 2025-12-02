import TaskItem from "../Task/TaskItem";
import { useState, useEffect } from "react";
import { findTimeDifference } from "../../helpers/helperFunctions";

const TaskList = ({
  tasks,
  headings,
  columns,
  title,
  openTaskView,
  refreshTasks,
  caseId,
  refreshCaseData,
  refreshActivityData,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTask, setNewTask] = useState(false);

  return (
    <>
      {title && (
        <div
          className="tasks-list-heading"
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
            } else setIsCollapsed(true);
          }}
        >
          {!isCollapsed ? (
            <i className="fa-solid fa-caret-down"></i>
          ) : (
            <i className="fa-solid fa-caret-up"></i>
          )}

          <h4>{title}</h4>
        </div>
      )}
      <div className="task-sections-wrapper">
        <div
          className="tasks-list-row"
          style={{ gridTemplateColumns: `${columns}` }}
        >
          {title &&
            !isCollapsed &&
            tasks.map((task) => {
              return (
                <TaskItem
                  key={`task-${task.taskId}`}
                  task={task}
                  headings={headings}
                  openTaskView={openTaskView}
                  refreshTasks={refreshTasks}
                  date={title}
                  columns={columns}
                />
              );
            })}
          {!title &&
            tasks.map((task) => {
              return (
                <TaskItem
                  key={task.taskId || task.title}
                  task={task}
                  headings={headings}
                  openTaskView={openTaskView}
                  refreshTasks={refreshTasks}
                  date={title}
                  columns={columns}
                />
              );
            })}
          {!isCollapsed && (
            <div
              className={
                newTask
                  ? "new-task-toggle-wrapper-active"
                  : "new-task-toggle-wrapper"
              }
            >
              {!newTask ? (
                <a className="new-task-toggle" onClick={() => setNewTask(true)}>
                  <i className="fa-solid fa-plus"></i>Add task...
                </a>
              ) : (
                <TaskItem
                  task={{}}
                  newTask={newTask}
                  headings={headings}
                  openTaskView={openTaskView}
                  setNewTask={setNewTask}
                  refreshTasks={refreshTasks}
                  date={title}
                  caseId={caseId}
                  refreshCaseData={refreshCaseData}
                  refreshActivityData={refreshActivityData}
                  columns={columns}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskList;
