import TaskItem from "./TaskItem";
import { useState, useEffect } from "react";
import { findTimeDifference } from "../helpers/helperFunctions";

const TaskList = ({ tasks, headings, columns, title, openTaskView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            (tasks.length > 0 ? (
              tasks.map((task) => {
                return (
                  <TaskItem
                    key={`task-${task.taskId}`}
                    task={task}
                    headings={headings}
                    openTaskView={openTaskView}
                  />
                );
              })
            ) : (
              <p>No tasks to show</p>
            ))}
          {!title &&
            tasks.map((task) => {
              return (
                <TaskItem
                  key={task.taskId || task.title}
                  task={task}
                  headings={headings}
                  openTaskView={openTaskView}
                />
              );
            })}
        </div>
      </div>
    </>
  );
};

export default TaskList;
