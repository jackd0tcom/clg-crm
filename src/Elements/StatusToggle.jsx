import { capitalize } from "../helpers/helperFunctions";
import { useState, useRef, useEffect } from "react";
import StatusIcon from "./StatusIcon";

const StatusToggle = ({ value, onHandle, setStatus, status }) => {
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
    <div className="status-toggle-wrapper">
      <div className="status-toggle-closed" onClick={() => setChanging(true)}>
        <StatusIcon
          status={status}
          hasIcon={true}
          hasTitle={true}
          coloredIcon={true}
        />
      </div>
      {changing && (
        <div className="status-toggle-dropdown" ref={dropdownRef}>
          <div
            className="dropdown-status"
            onClick={() => {
              onHandle("not started");
              setStatus("not started");
              setChanging(false);
            }}
          >
            <StatusIcon
              status={"not started"}
              hasIcon={true}
              hasTitle={true}
              noBg={true}
            />
          </div>
          <div
            className="dropdown-status"
            onClick={() => {
              onHandle("in progress");
              setStatus("in progress");
              setChanging(false);
            }}
          >
            <StatusIcon
              status={"in progress"}
              hasIcon={true}
              hasTitle={true}
              noBg={true}
            />
          </div>
          <div
            className="dropdown-status"
            onClick={() => {
              onHandle("blocked");
              setStatus("blocked");
              setChanging(false);
            }}
          >
            <StatusIcon
              status={"blocked"}
              hasIcon={true}
              hasTitle={true}
              noBg={true}
            />
          </div>
          <div
            className="dropdown-status"
            onClick={() => {
              onHandle("completed");
              setStatus("completed");
              setChanging(false);
            }}
          >
            <StatusIcon
              status={"completed"}
              hasIcon={true}
              hasTitle={true}
              noBg={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default StatusToggle;
