import { capitalize } from "../helpers/helperFunctions";
import TaskListItem from "../Elements/TaskListItem";
import { Link } from "react-router";

const CaseCard = ({ data }) => {
  return (
    <a href={`/case/${data.caseId}`}>
      <div className="case-card-wrapper">
        <div className="case-card-head">
          <p>{data.priority}</p>
          {data.practiceAreas.length > 0
            ? data.practiceAreas.map((area) => {
                return <h4 key={area.name}>{capitalize(area.name)}</h4>;
              })
            : ""}
          <h3>{data.title}</h3>
        </div>
        <div className="case-card-tasks">
          <h3>To Do:</h3>
          {data.tasks.map((task) => {
            return <TaskListItem key={task.taskId} task={task} />;
          })}
        </div>
      </div>
    </a>
  );
};

export default CaseCard;
