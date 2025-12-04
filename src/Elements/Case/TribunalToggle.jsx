import { capitalize } from "../../helpers/helperFunctions";
import { useState, useEffect, useRef } from "react";
import PhaseIcon from "./PhaseIcon";
import axios from "axios";

const TribunalToggle = ({
  currentTribunal,
  setCurrentTribunal,
  caseId,
  refreshActivityData,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);

  // Handles blur
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

  const handleTribunalChange = async (tribunal) => {
    try {
      if (!caseId) {
        return;
      }
      if (currentTribunal && tribunal) {
        if (tribunal === currentTribunal) {
          return;
        }
      }
      await axios
        .post("/api/updateCase", {
          fieldName: "tribunal",
          value: tribunal,
          caseId,
        })
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            setCurrentTribunal(tribunal);
          }
          if (refreshActivityData) {
            refreshActivityData();
          }
        });
    } catch (error) {}
  };

  return (
    <div className="tribunal-toggle-wrapper">
      <button
        className="tribunal-toggle-button"
        onClick={() => setIsChanging(true)}
      >
        {!currentTribunal ? "Set Tribunal" : currentTribunal}
      </button>
      {isChanging && (
        <div className="tribunal-toggle-dropdown" ref={dropdownRef}>
          <div className="tribunal-dropdown-item"></div>
        </div>
      )}
    </div>
  );
};
export default TribunalToggle;
