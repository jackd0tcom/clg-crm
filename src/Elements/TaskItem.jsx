import { formatDateNoTime, capitalize } from "../helpers/helperFunctions";

const TaskItem = ({ task }) => {
  return (
    <tr className="task-list-item">
      <td className="task-title-td">{task.title}</td>
      <td>{capitalize(task.status)}</td>
      <td className="task-item-assignee-photo-wrapper">
        {task.assignees.map((nee) => {
          return (
            <div
              className="task-item-assignee-photo"
              style={{ backgroundImage: `url(${nee.profilePic})` }}
            ></div>
          );
        })}
      </td>
      <td>{formatDateNoTime(task.dueDate)}</td>
    </tr>
  );
};

export default TaskItem;
