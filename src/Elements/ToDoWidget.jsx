import { useEffect, useState } from "react";
import axios from "axios";
import TaskList from "./TaskList";
import { useNavigate } from "react-router";

const ToDoWidget = ({ openTaskView, userSynced, refreshKey }) => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      await axios.get("/api/getTodayTasks").then((res) => {
        setTasks(res.data.filter((task) => task.status !== "completed"));
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Only fetch tasks if user is synced
    if (!userSynced) return;
    fetch();
  }, [userSynced, refreshKey]);

  return (
    <div className="widget-container">
      <div className="widget-header">
        <p className="widget-heading" onClick={() => navigate("/tasks")}>
          To Do
        </p>
      </div>
      <div className="widget-tasklist">
        <TaskList
          tasks={tasks}
          openTaskView={openTaskView}
          headings={["Status", "Title", "Case", "Due Date"]}
          title={"Due Today"}
          refreshTasks={fetch}
          columns={"0.1fr 1.5fr 2fr 0.7fr"}
        />
      </div>
    </div>
  );
};
export default ToDoWidget;
