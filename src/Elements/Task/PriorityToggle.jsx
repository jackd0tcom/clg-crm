import { capitalize } from "../../helpers/helperFunctions";
import PriorityIcon from "./PriorityIcon";
import { useState, useRef, useEffect } from "react";
const PriorityToggle = ({ value, onHandle, setPriority, priority }) => {
  const [changing, setChanging] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setChanging(false);
      }
    };

    if (changing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [changing]);

  return (
    <div className="priority-toggle-wrapper">
      <div onClick={() => setChanging(true)}>
        <PriorityIcon data={value} />
      </div>
      {changing && (
        <div className="priority-toggle-dropdown" ref={dropdownRef}>
          <div
            className="priority-toggle-container"
            onClick={() => {
              onHandle("low");
              setPriority("low");
              setChanging(false);
            }}
          >
            <PriorityIcon data={"low"} />
          </div>
          <div
            className="priority-toggle-container"
            onClick={() => {
              onHandle("normal");
              setPriority("normal");
              setChanging(false);
            }}
          >
            <PriorityIcon data={"normal"} />
          </div>
          <div
            className="priority-toggle-container"
            onClick={() => {
              onHandle("high");
              setPriority("high");
              setChanging(false);
            }}
          >
            <PriorityIcon data={"high"} />
          </div>
        </div>
      )}
    </div>
  );
};
export default PriorityToggle;
