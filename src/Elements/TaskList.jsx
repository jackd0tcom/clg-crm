import TaskItem from "./TaskItem";
import { useState, useEffect } from "react";
import { findTimeDifference } from "../helpers/helperFunctions";

const TaskList = ({ data, headings, isOrganized }) => {
  const [dueToday, setIsDueToday] = useState([]);
  const [overdue, setIsOverdue] = useState([]);
  const [upcoming, setIsUpcoming] = useState([]);

  const sections = ["Due Today", "Overdue", "Upcoming"];
  const columns = "3fr 2fr 2fr 1fr";

  const format = () => {
    setIsDueToday([]);
    setIsOverdue([]);
    setIsUpcoming([]);

    data.forEach((task) => {
      if (findTimeDifference(task.dueDate)[0] === "1") {
        setIsUpcoming((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "0") {
        setIsDueToday((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "2") {
        setIsOverdue((prev) => {
          return [...prev, task];
        });
      }
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      format();
    }
  }, [data]);
  const safeHeadings = Array.isArray(headings) ? headings : [];

  return (
    <>
      <div className="task-list">
        <div className="tasks-list-head">
          {safeHeadings.map((heading) => {
            return <p key={heading}>{heading}</p>;
          })}
        </div>
      </div>
      <div className="task-sections-wrapper">
        {isOrganized ? (
          sections.map((section) => {
            return (
              <div key={section} className="tasks-list-section">
                <div className="tasks-list-heading">
                  <p>{section}</p>
                </div>
                <div
                  className="tasks-list-row"
                  style={{ gridTemplateColumns: `${columns}` }}
                >
                  {section === "Due Today" && dueToday.length > 0 ? (
                    dueToday.map((task) => {
                      return (
                        <TaskItem
                          key={task.taskId || task.title}
                          task={task}
                          headings={safeHeadings}
                        />
                      );
                    })
                  ) : section === "Due Today" ? (
                    <p>No tasks due today</p>
                  ) : null}

                  {section === "Upcoming" && upcoming.length > 0 ? (
                    upcoming.map((task) => {
                      return (
                        <TaskItem
                          key={task.taskId || task.title}
                          task={task}
                          headings={safeHeadings}
                        />
                      );
                    })
                  ) : section === "Upcoming" ? (
                    <p>No upcoming tasks</p>
                  ) : null}

                  {section === "Overdue" && overdue.length > 0 ? (
                    overdue.map((task) => {
                      return (
                        <TaskItem
                          key={task.taskId || task.title}
                          task={task}
                          headings={safeHeadings}
                        />
                      );
                    })
                  ) : section === "Overdue" ? (
                    <p>No overdue tasks</p>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : data && data.length > 0 ? (
          data.map((task) => {
            return (
              <TaskItem
                key={task.taskId || task.title}
                task={task}
                headings={safeHeadings}
              />
            );
          })
        ) : (
          <p>No tasks available</p>
        )}
      </div>
    </>
  );
};

export default TaskList;
