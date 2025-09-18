import { capitalize } from "../helpers/helperFunctions";
import TaskListItem from "../Elements/TaskListItem";
import { Link, useNavigate } from "react-router";
import TaskList from "./TaskList";
import { addRecentItem } from "../helpers/recentItemsHelper";
import { useEffect, useState } from "react";

const CaseCard = ({ data, openTaskView }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (data.tasks.length > 0) {
      setTasks(data.tasks.slice(0, 2));
    }
  }, []);

  const handleCaseClick = (e) => {
    e.preventDefault();
    // Add case to recent items before navigating
    addRecentItem(data, "case");
    navigate(`/case/${data.caseId}`);
  };

  return (
    <a
      className="case-card-link"
      href={`/case/${data.caseId}`}
      onClick={handleCaseClick}
    >
      <div className="case-card-wrapper">
        <div className="case-card-head">
          <p className="case-card-phase">{capitalize(data.phase)}</p>
          <h3 className="case-card-title">{data.title}</h3>
          <div className="case-card-practice-areas">
            {data.practiceAreas.length > 0
              ? data.practiceAreas.map((area, idx) => {
                  if (data.practiceAreas.length === 1) {
                    return (
                      <h4 className="subheading" key={area.name}>
                        {`${capitalize(area.name)}`}
                      </h4>
                    );
                  } else if (idx === data.practiceAreas.length - 1) {
                    return (
                      <h4 className="subheading" key={area.name}>
                        {` & ${capitalize(area.name)}`}
                      </h4>
                    );
                  } else if (idx === data.practiceAreas.length - 2) {
                    return (
                      <h4 className="subheading" key={area.name}>
                        {`${capitalize(area.name)}`}
                      </h4>
                    );
                  } else
                    return (
                      <h4 className="subheading" key={area.name}>
                        {`${capitalize(area.name)}, `}
                      </h4>
                    );
                })
              : ""}
          </div>
        </div>
        <div className="case-card-tasks">
          <h4>To Do:</h4>
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
            <p className="no-tasks">All caught up!</p>
          )}
        </div>
      </div>
    </a>
  );
};

export default CaseCard;
