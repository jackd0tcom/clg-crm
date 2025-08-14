const TaskListItem = ({ task }) => {
  return (
    <div className="task-list-item">
      <i className="fa-regular fa-circle"></i>
      <h5>{task.title}</h5>
    </div>
  );
};

export default TaskListItem;
