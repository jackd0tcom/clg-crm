import { capitalize } from "../helpers/helperFunctions";
import TaskListItem from "../Elements/TaskListItem";
import { Link } from "react-router";
import TaskList from "./TaskList";

const CaseCard = ({ data, openTaskView }) => {
  const tasks = data.tasks.slice(0, 2);
  return (
    <a href={`/case/${data.caseId}`}>
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
          {tasks.map((task) => {
            return (
              <TaskListItem
                key={task.taskId}
                task={task}
                openTaskView={openTaskView}
              />
            );
          })}
        </div>
      </div>
    </a>
  );
};

export default CaseCard;
