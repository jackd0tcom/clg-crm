import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";

const PracticeAreaToggle = ({
  currentAreas,
  setCurrentAreas,
  newPracticeArea,
  setNewPracticeArea,
  caseId,
  refreshCaseData,
  refreshActivityData,
  isAddingArea,
  setIsAddingArea,
}) => {
  const [allAreas, setAllAreas] = useState();
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      axios.get("/api/getPracticeAreas").then((res) => {
        const all = res.data;
        setAllAreas(
          all.filter(
            (area) =>
              !currentAreas.some(
                (current) => current.practiceAreaId === area.practiceAreaId
              )
          )
        );
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddingArea(false);
      }
    };

    if (isAddingArea || isAddingPerson) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingArea]);

  const handleAdd = (id) => {
    try {
      axios
        .post("/api/addCasePracticeArea", { caseId, practiceAreaId: id })
        .then((res) => {
          if ((res.status = 200)) {
            refreshCaseData();
            refreshActivityData();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemove = (id) => {
    try {
      axios
        .post("/api/removeCasePracticeArea", { caseId, practiceAreaId: id })
        .then((res) => {
          refreshCaseData();
          refreshActivityData();
          setNewPracticeArea("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="toggle-overlay" ref={dropdownRef}>
      <div className="practice-area-toggle-wrapper">
        <div className="practice-area-list-wrapper">
          <p className="practice-area-toggle-heading">Practice Areas</p>
          {currentAreas &&
            currentAreas.map((area) => {
              return (
                <div key={area.practiceAreaId}>
                  <div
                    onClick={() => {
                      setNewPracticeArea(area.practiceAreaId);
                      handleRemove(area.practiceAreaId);
                      setIsAddingArea(false);
                    }}
                    className="practice-area-item current-area"
                  >
                    {capitalize(area.name)}
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>
              );
            })}
          {allAreas &&
            allAreas.map((area) => {
              return (
                <div key={area.practiceAreaId}>
                  <div
                    onClick={() => {
                      setNewPracticeArea(area.practiceAreaId);
                      handleAdd(area.practiceAreaId);
                      setIsAddingArea(false);
                    }}
                    className="practice-area-item"
                  >
                    {capitalize(area.name)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default PracticeAreaToggle;
