import { capitalize } from "../../helpers/helperFunctions";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const TribunalToggle = ({
  currentTribunal,
  setCurrentTribunal,
  caseId,
  refreshActivityData,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [tribunalList, setTribunalList] = useState([]);
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

  useEffect(() => {
    try {
      axios.get("/api/getTribunals").then((res) => setTribunalList(res.data));
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleTribunalChange = async (tribunalId, tribunalName) => {
    try {
      if (!caseId) {
        console.log("returning due to no case Id");
        return;
      }
      if (currentTribunal && currentTribunal.tribunalId && tribunalId) {
        if (tribunalId === currentTribunal.tribunalId) {
          console.log("returning due to no change in tribunalId");
          return;
        }
      }
      await axios
        .post("/api/updateCaseTribunal", {
          caseId,
          tribunalId,
        })
        .then((res) => {
          if (res.status) {
            setCurrentTribunal({ tribunalId, name: tribunalName });
          }
          if (refreshActivityData) {
            refreshActivityData();
          }
          setIsChanging(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="tribunal-toggle-wrapper">
      <button
        className="tribunal-toggle-button"
        onClick={() => setIsChanging(true)}
      >
        {currentTribunal?.name
          ? capitalize(currentTribunal.name)
          : "Set Tribunal"}
      </button>
      {isChanging && (
        <div className="tribunal-toggle-dropdown" ref={dropdownRef}>
          {tribunalList &&
            tribunalList.length > 0 &&
            tribunalList.map((tri) => (
              <div
                key={`tribunal-${tri.tribunalId}`}
                className="tribunal-dropdown-item"
                onClick={() => handleTribunalChange(tri.tribunalId, tri.name)}
              >
                {capitalize(tri.name)}
                {currentTribunal && currentTribunal.name === tri.name && (
                  <i className="fa-solid fa-check"></i>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default TribunalToggle;
