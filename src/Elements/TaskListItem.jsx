const TaskListItem = ({ task, openTaskView }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openTaskView) {
      openTaskView(task.taskId);
    }
  };

  return (
    <div 
      className="task-list-item-condensed"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <i className="fa-regular fa-circle"></i>
      <h5>{task.title}</h5>
    </div>
  );
};

export default TaskListItem;
