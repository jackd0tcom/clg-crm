import { capitalize } from "../../helpers/helperFunctions";
import { useState, useEffect, useRef } from "react";
import PhaseIcon from "./PhaseIcon";

const PhaseToggle = ({ value, onHandle, setPhase }) => {
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsChanging(false);
      }
    };

    if (isChanging) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChanging]);

  return (
    <div className="phase-toggle-wrapper">
      <button
        className="phase-toggle-button"
        onClick={() => setIsChanging(true)}
      >
        <PhaseIcon phase={value} />
      </button>
      {isChanging && (
        <div className="phase-toggle-dropdown" ref={dropdownRef}>
          <div
            onClick={() => {
              onHandle("intake");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"intake"} />
          </div>
          <div
            onClick={() => {
              onHandle("investigation");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"investigation"} />
          </div>
          <div
            onClick={() => {
              onHandle("negotiation");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"negotiation"} />
          </div>
          <div
            onClick={() => {
              onHandle("litigation");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"litigation"} />
          </div>
          <div
            onClick={() => {
              onHandle("settlement");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"settlement"} />
          </div>
          <div
            onClick={() => {
              onHandle("closed");
              setIsChanging(false);
            }}
            className="phase-toggle-item"
          >
            <PhaseIcon phase={"closed"} />
          </div>
        </div>
      )}
    </div>
  );
};
export default PhaseToggle;
