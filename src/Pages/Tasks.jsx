import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Elements/UI/Loader";
import TaskList from "../Elements/TaskList/TaskList";
import { findTimeDifference } from "../helpers/helperFunctions";
import { useParams } from "react-router";
import TaskFilter from "../Elements/TaskList/TaskFilter";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Tasks = ({ openTaskView, refreshKey }) => {
  const user = useSelector((state) => state.user);
  const { isAuthenticated, isLoading } = useAuth0();
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(true);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [noDueDate, setNoDueDate] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAssigned, setShowAssigned] = useState(true);
  const columns = "0.1fr 3fr 2fr 2fr 1fr";
  const headings = ["", "Title", "Case", "Assignees", "Due Date"];
  const caseId = useParams();
  const nav = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/getAllTasks");
      setOriginalTasks(res.data);
      // setTasks(res.data.filter((task) => task.status !== "completed"));
    } catch (error) {
      setLoading(false);
      console.log(error);
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

  // Handles tasks array filtering
  useEffect(() => {
    const nonCompletedTasks = originalTasks.filter(
      (task) => task.status !== "completed"
    );
    const completedTasks = originalTasks.filter(
      (task) => task.status === "completed"
    );

    if (!showCompleted) {
      showAssigned
        ? setTasks(
            nonCompletedTasks.filter((task) =>
              task.assignees.some((nee) => nee.userId === user.userId)
            )
          )
        : setTasks(nonCompletedTasks);
    } else if (showCompleted) {
      showAssigned
        ? setTasks(
            completedTasks.filter((task) =>
              task.assignees.some((nee) => nee.userId === user.userId)
            )
          )
        : setTasks(completedTasks);
    }

    setLoading(false);
  }, [originalTasks, showCompleted, showAssigned]);

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
    setNoDueDate([]); // Add this line to clear noDueDate array

    tasks.forEach((task) => {
      if (!task.dueDate) {
        setNoDueDate((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "1") {
        setUpcoming((prev) => {
          return [...prev, task];
        });
      } else if (findTimeDifference(task.dueDate)[0] === "0") {
        console.log(findTimeDifference(task.dueDate[0]));
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
          paramCase={caseId}
          filtering={filtering}
          setFiltering={setFiltering}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          showAssigned={showAssigned}
          setShowAssigned={setShowAssigned}
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
        {showCompleted ? (
          <TaskList
            openTaskView={openTaskView}
            tasks={tasks}
            headings={["Status", "Title", "Case", "Assignees", "Due Date"]}
            columns={columns}
            title={"Completed"}
            refreshTasks={fetchTasks}
          />
        ) : (
          <>
            <TaskList
              openTaskView={openTaskView}
              tasks={noDueDate}
              headings={["Status", "Title", "Case", "Assignees", "Due Date"]}
              columns={columns}
              title={"No Due Date"}
              refreshTasks={fetchTasks}
            />
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
          </>
        )}
      </div>
    </div>
  );
};
export default Tasks;
