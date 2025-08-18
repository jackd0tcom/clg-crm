import { capitalize } from "../helpers/helperFunctions";
import { useState } from "react";
const PhaseToggle = ({ value, onHandle, setPhase }) => {
  return (
    <div className="phase-toggle-wrapper">
      <div className="phase-toggle-active">
        <select
          name="phase-select"
          id=""
          value={value}
          onChange={(e) => {
            onHandle(e.target.value);
            setPhase(e.target.value);
          }}
        >
          <option value="intake">Intake</option>
          <option value="investigation">Investigation</option>
          <option value="negotiation">Negotiation</option>
          <option value="litigation">Litigation</option>
          <option value="settlement">Settlement</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
};
export default PhaseToggle;
