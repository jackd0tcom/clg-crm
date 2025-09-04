import { formatDateNoTime } from "../helpers/helperFunctions";
import StatusIcon from "./StatusIcon";

const TaskListItem = ({ task, openTaskView }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openTaskView) {
      openTaskView(task.taskId);
    }
  };

  return (
    <div className="task-list-item-condensed" onClick={handleClick}>
      <StatusIcon status={task.status} hasIcon={true} hasTitle={false} />
      <p className="task-list-item-title">{task.title}</p>
      <p className="task-list-item-date">{formatDateNoTime(task.dueDate)}</p>
    </div>
  );
};

export default TaskListItem;
