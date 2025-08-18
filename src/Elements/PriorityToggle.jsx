import { capitalize } from "../helpers/helperFunctions";
import { useState } from "react";
const PriorityToggle = ({ value, onHandle, setPriority }) => {
  return (
    <div className="priority-toggle-wrapper">
      <div className="priority-toggle-active">
        <select
          name="priority-select"
          id=""
          value={value}
          onChange={(e) => {
            onHandle(e.target.value);
            setPriority(e.target.value);
          }}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
};
export default PriorityToggle;
