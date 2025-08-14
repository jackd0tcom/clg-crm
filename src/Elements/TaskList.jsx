import TaskItem from "./TaskItem";

const TaskList = ({ data }) => {
  return (
    <div className="task-list-wrapper">
      <table className="task-list-table">
        <tr>
          <th className="task-title">Name</th>
          <th>Status</th>
          <th>Assignee</th>
          <th>Due Date</th>
        </tr>
      </table>
      {data.map((task) => {
        return <TaskItem key={task.taskId} task={task} />;
      })}
    </div>
  );
};

export default TaskList;
