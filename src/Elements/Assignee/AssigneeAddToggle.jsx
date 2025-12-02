const AssigneeAddToggle = ({
  nonAssigneeList,
  setNonAssigneeList,
  handleAdd,
  setIsAdding,
  Id,
}) => {
  return (
    <div className="assignee-add-toggle-wrapper">
      <p>Add Assignees</p>
      {nonAssigneeList.length > 0 ? (
        nonAssigneeList.map((nee) => {
          return (
            <div
              key={nee.userId}
              className="assignee-add-toggle-item"
              onClick={() => {
                handleAdd({ Id, userId: nee.userId });
              }}
            >
              <img
                className="assignee-add-toggle-pic"
                src={nee.profilePic}
                alt=""
              />
              <p>{nee.firstName}</p>
            </div>
          );
        })
      ) : (
        <div className="assignee-add-toggle-item no-users-found">
          No other users found.
        </div>
      )}
    </div>
  );
};
export default AssigneeAddToggle;
