import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import TaskList from "../Elements/TaskList";
import { findTimeDifference } from "../helpers/helperFunctions";
import { useParams } from "react-router";
import TaskFilter from "../Elements/TaskFilter";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";

const Tasks = ({ openTaskView, refreshKey }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const [tasks, setTasks] = useState();
  const [completedTasks, setCompletedTasks] = useState();
  const [notCompletedTasks, setNotCompletedTasks] = useState();
  const [loading, setLoading] = useState(true);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const columns = "0.1fr 3fr 2fr 2fr 1fr";
  const headings = ["", "Title", "Case", "Assignees", "Due Date"];
  const caseId = useParams();
  const nav = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/getAllTasks");
      const nonCompleted = res.data.filter((ta) => ta.status !== "completed");
      const completed = res.data.filter((ta) => ta.status === "completed");
      setNotCompletedTasks(nonCompleted);
      setCompletedTasks(completed);
      setTasks(nonCompleted);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setTimeout(() => {
        fetchTasks();
      }, 100);
    } else if (!isLoading && !isAuthenticated) {
      nav("/");
    }
  }, []);

  // Refetch tasks when refreshKey change
  useEffect(() => {
    if (refreshKey > 0) {
      // Only fetch if we're not filtering by a specific case
      // The TaskFilter component will handle filtering
      fetchTasks();
    }
  }, [refreshKey]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      format();
    } else if (tasks && tasks.length === 0) {
      // Handle empty filtered results
      setDueToday([]);
      setOverdue([]);
      setUpcoming([]);
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

  return loading ? (
    <Loader />
  ) : (
    <div className="tasks-page-wrapper">
      <div className="tasks-page-head">
        <h1 className="section-heading">My Tasks</h1>
        <TaskFilter
          tasks={tasks}
          setTasks={setTasks}
          completedTasks={completedTasks}
          notCompletedTasks={notCompletedTasks}
          paramCase={caseId}
        />
        <button className="new-task-button" onClick={() => openTaskView("new")}>
          New Task
        </button>
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
          headings={["Status", "Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Overdue"}
          refreshTasks={fetchTasks}
        />
        <TaskList
          openTaskView={openTaskView}
          tasks={dueToday}
          headings={["Status", "Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Due Today"}
          refreshTasks={fetchTasks}
        />
        <TaskList
          openTaskView={openTaskView}
          tasks={upcoming}
          headings={["Status", "Title", "Case", "Assignees", "Due Date"]}
          columns={columns}
          title={"Upcoming"}
          refreshTasks={fetchTasks}
        />
      </div>
    </div>
  );
};
export default Tasks;
