const AssigneeAddToggle = ({
  nonAssigneeList,
  setNonAssigneeList,
  handleAdd,
  setIsAdding,
  caseId,
}) => {
  return (
    <div className="assignee-add-toggle-wrapper">
      <p>Add Assignees</p>
      {nonAssigneeList.length > 0 ? (
        nonAssigneeList.map((nee) => {
          return (
            <div
              className="assignee-add-toggle-item"
              onClick={() => {
                console.log(nee.profilePic);
                handleAdd({ caseId, userId: nee.userId });
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
        <div className="assignee-add-toggle-item">No other users found.</div>
      )}
    </div>
  );
};
export default AssigneeAddToggle;
