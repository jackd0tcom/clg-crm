import TaskItem from "./TaskItem";

const TaskList = ({ data }) => {
  return (
    <div className="task-list-wrapper">
      <div className="task-list">
        <div className="task-list-head">
          <p className="task-title">Name</p>
          <p>Status</p>
          <p>Assignee</p>
          <p>Due Date</p>
        </div>
        {data.map((task) => {
          return <TaskItem key={task.taskId} task={task} />;
        })}
      </div>
    </div>
  );
};

export default TaskList;
