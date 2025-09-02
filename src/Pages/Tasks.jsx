import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import TaskList from "../Elements/TaskList";
import { findTimeDifference } from "../helpers/helperFunctions";

const Tasks = ({ openTaskView }) => {
  const [tasks, setTasks] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const columns = "3fr 2fr 2fr 1fr";
  const headings = ["Title", "Case", "Assignees", "Due Date"];

  useEffect(() => {
    async function fetch() {
      try {
        axios.get("/api/getAllTasks").then((res) => {
          setTasks(res.data);
          setIsLoading(false);
        });
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      format();
    }
  }, [tasks]);

  const format = () => {
    setDueToday([]);
    setOverdue([]);
    setUpcoming([]);

    tasks.forEach((task) => {
      if (findTimeDifference(task.dueDate)[0] === "1") {
        setUpcoming((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "0") {
        setDueToday((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "2") {
        setOverdue((prev) => {
          return [...prev, task];
        });
      }
    });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="tasks-page-wrapper">
      <div className="tasks-page-head">
        <h1 className="section-heading">My Tasks</h1>
      </div>
      <div className="task-list">
        <div className="tasks-list-head">
          {headings.map((heading) => {
            return <p key={heading}>{heading}</p>;
          })}
        </div>
      </div>
      <div className="task-page-task-list-wrapper">
        <TaskList
          openTaskView={openTaskView}
          tasks={overdue}
          headings={["Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Overdue"}
        />
        <TaskList
          openTaskView={openTaskView}
          tasks={dueToday}
          headings={["Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Due Today"}
        />
        <TaskList
          openTaskView={openTaskView}
          tasks={upcoming}
          headings={["Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Upcoming"}
        />
      </div>
    </div>
  );
};
export default Tasks;
