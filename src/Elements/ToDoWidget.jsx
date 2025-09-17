import { useEffect, useState } from "react";
import axios from "axios";
import TaskList from "./TaskList";
import { useNavigate } from "react-router";

const ToDoWidget = ({ openTaskView }) => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      await axios.get("/api/getTodayTasks").then((res) => {
        setTasks(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="widget-container">
      <p className="widget-heading" onClick={() => navigate("/tasks")}>
        To Do
      </p>
      <TaskList
        tasks={tasks}
        openTaskView={openTaskView}
        headings={["Title", "Case", "Due Date"]}
        title={"Due Today"}
        refreshTasks={fetch}
        columns={"3fr 2fr 1.2fr"}
      />
    </div>
  );
};
export default ToDoWidget;
