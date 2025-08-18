import { capitalize } from "../helpers/helperFunctions";
import { useState } from "react";
const StatusToggle = ({ value, onHandle, setStatus }) => {
  return (
    <div className="status-toggle-wrapper">
      <div className="status-toggle-active">
        <select
          name="status-select"
          id=""
          value={value}
          onChange={(e) => {
            onHandle(e.target.value);
            setStatus(e.target.value);
          }}
        >
          <option value="not started">Not Started</option>
          <option value="in progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
};
export default StatusToggle;
