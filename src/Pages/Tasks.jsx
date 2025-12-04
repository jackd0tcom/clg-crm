import { useEffect, useState, useRef } from "react";
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
  const columns = "0.2fr 3fr 3fr 2fr 2fr 1fr";
  const headings = ["", "Title", "Case", "Assignees", "Priority", "Due Date"];
  const [currentSort, setCurrentSort] = useState("Due Date");
  const [isSorting, setIsSorting] = useState(false);
  const dropdownRef = useRef(null);
  const caseId = useParams();
  const nav = useNavigate();

  // Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSorting(false);
      }
    };
    if (isSorting) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSorting]);

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

  // Initial task fetching and sorting, useTimeout to give auth a little buffer on page reloads
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setTimeout(() => {
        fetchTasks();
        sort("dueDate");
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

  // Refetch tasks when refreshKey change aka when you close TaskView
  useEffect(() => {
    if (refreshKey > 0) {
      // Only fetch if we're not filtering by a specific case
      // The TaskFilter component will handle filtering
      fetchTasks();
      sort(currentSort);
    }
  }, [refreshKey]);

  // Formats tasks on change of filter
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      format();
    } else if (tasks && tasks.length === 0) {
      // Handle empty filtered results
      setDueToday([]);
      setOverdue([]);
      setUpcoming([]);
      setNoDueDate([]);
    }
  }, [tasks]);

  // Separates tasks into their respective groups based on dueDate
  const format = () => {
    setDueToday([]);
    setOverdue([]);
    setUpcoming([]);
    setNoDueDate([]);

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

  const priorities = ["low", "normal", "high"];
  const sort = (param) => {
    if (!tasks || tasks.length <= 0) {
      return;
    }
    let tasksArr = tasks;
    switch (param) {
      case "dueDate":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
        );
        break;
      case "lastUpdated":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        );
        break;
      case "firstUpdated":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          )
        );
        break;
      case "lastCreated":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        break;
      case "firstCreated":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
        break;
      case "highPriority":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              priorities.indexOf(b.priority) - priorities.indexOf(a.priority)
          )
        );
        break;
      case "lowPriority":
        setTasks(
          tasksArr.sort(
            (a, b) =>
              priorities.indexOf(a.priority) - priorities.indexOf(b.priority)
          )
        );
        break;
      default:
        setTasks(
          tasksArr.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
        );
    }
    format();
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
        <div className="tasks-sort-wrapper">
          <p className="sort-by">Sort by</p>
          <button
            onClick={() => setIsSorting(true)}
            className="tasks-sort-button"
          >
            {currentSort}
          </button>
          {isSorting && (
            <div className="tasks-sort-dropdown" ref={dropdownRef}>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("dueDate");
                  setCurrentSort("Due Date");
                  setIsSorting(false);
                }}
              >
                Due Date
                {currentSort === "Due Date" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("lastUpdated");
                  setCurrentSort("Last Updated");
                  setIsSorting(false);
                }}
              >
                <p>
                  Updated{" "}
                  <span className="tasks-sort-subtext">(new - old)</span>
                </p>
                {currentSort === "Last Updated" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("firstUpdated");
                  setCurrentSort("First Updated");
                  setIsSorting(false);
                }}
              >
                <p>
                  Updated{" "}
                  <span className="tasks-sort-subtext">(old - new)</span>
                </p>
                {currentSort === "First Updated" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("lastCreated");
                  setCurrentSort("Last Created");
                  setIsSorting(false);
                }}
              >
                <p>
                  Created{" "}
                  <span className="tasks-sort-subtext">(new - old)</span>
                </p>
                {currentSort === "Last Created" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("firstCreated");
                  setCurrentSort("First Created");
                  setIsSorting(false);
                }}
              >
                <p>
                  Created{" "}
                  <span className="tasks-sort-subtext">(old - new)</span>
                </p>
                {currentSort === "First Created" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>{" "}
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("highPriority");
                  setCurrentSort("High Priority");
                  setIsSorting(false);
                }}
              >
                <p>High Priority</p>
                {currentSort === "High Priority" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
              <div
                className="tasks-sort-dropdown-item"
                onClick={() => {
                  sort("lowPriority");
                  setCurrentSort("Low Priority");
                  setIsSorting(false);
                }}
              >
                <p>Low Priority</p>
                {currentSort === "Low Priority" && (
                  <i className="case-filter-check fa-solid fa-check"></i>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="new-task-button" onClick={() => openTaskView("new")}>
          New Task
        </button>
      </div>
      <div className="task-list task-list-head-wrapper">
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
            headings={[
              "Status",
              "Title",
              "Case",
              "Assignees",
              "Priority",
              "Due Date",
            ]}
            columns={columns}
            title={"Completed"}
            refreshTasks={fetchTasks}
          />
        ) : (
          <>
            <TaskList
              openTaskView={openTaskView}
              tasks={noDueDate}
              headings={[
                "Status",
                "Title",
                "Case",
                "Assignees",
                "Priority",
                "Due Date",
              ]}
              columns={columns}
              title={"No Due Date"}
              refreshTasks={fetchTasks}
            />
            <TaskList
              openTaskView={openTaskView}
              tasks={overdue}
              headings={[
                "Status",
                "Title",
                "Case",
                "Assignees",
                "Priority",
                "Due Date",
              ]}
              columns={columns}
              title={"Overdue"}
              refreshTasks={fetchTasks}
            />
            <TaskList
              openTaskView={openTaskView}
              tasks={dueToday}
              headings={[
                "Status",
                "Title",
                "Case",
                "Assignees",
                "Priority",
                "Due Date",
              ]}
              columns={columns}
              title={"Due Today"}
              refreshTasks={fetchTasks}
            />
            <TaskList
              openTaskView={openTaskView}
              tasks={upcoming}
              headings={[
                "Status",
                "Title",
                "Case",
                "Assignees",
                "Priority",
                "Due Date",
              ]}
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
