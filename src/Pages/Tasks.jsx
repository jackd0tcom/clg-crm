import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import TaskList from "../Elements/TaskList";

const Tasks = () => {
  const [tasks, setTasks] = useState();
  const [isLoading, setIsLoading] = useState(true);

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

  return isLoading ? (
    <Loader />
  ) : (
    <div className="tasks-page-wrapper">
      <div className="tasks-page-head">
        <h1 className="section-heading">My Tasks</h1>
      </div>
      <TaskList
        data={tasks}
        headings={["Title", "Case", "Assignees", "Due Date"]}
        isOrganized={true}
      />
    </div>
  );
};
export default Tasks;
