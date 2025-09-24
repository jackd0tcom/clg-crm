import { capitalize, formatPracticeAreas } from "../helpers/helperFunctions";
import TaskListItem from "../Elements/TaskListItem";
import { Link, useNavigate } from "react-router";
import TaskList from "./TaskList";
import { addRecentItem } from "../helpers/recentItemsHelper";
import { useEffect, useState } from "react";
import PhaseIcon from "./PhaseIcon";

const CaseCard = ({ data, openTaskView }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (data.tasks.length > 0) {
      setTasks(data.tasks.slice(0, 2));
    }
  }, []);

  const handleCaseClick = (e) => {
    // Add case to recent items before navigating
    addRecentItem(data, "case");
    navigate(`/case/${data.caseId}`);
  };

  return (
    <div
      className="case-card-wrapper"
      onClick={() => {
        handleCaseClick();
        navigate(`/case/${data.caseId}`);
      }}
    >
      <div className="case-card-head">
        <PhaseIcon phase={data.phase} />
        <h3 className="case-card-title">{data.title}</h3>
        <div className="case-card-practice-areas">
          {formatPracticeAreas(data.practiceAreas)}
        </div>
      </div>
      <div className="case-card-tasks">
        <h4>To Do:</h4>
        <div className="case-card-task-list">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              return (
                <TaskListItem
                  key={task.taskId}
                  task={task}
                  openTaskView={openTaskView}
                />
              );
            })
          ) : (
            <p className="no-tasks">
              <i className="fa-solid fa-circle-check"></i> All caught up!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
