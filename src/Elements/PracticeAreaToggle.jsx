import { useEffect, useState } from "react";
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
          console.log("removed");
          refreshCaseData();
          refreshActivityData();
          setNewPracticeArea("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="toggle-overlay">
      <div className="practice-area-toggle-wrapper">
        <p
          onClick={() => {
            setIsAddingArea(false);
          }}
        >
          X
        </p>
        <div className="practice-area-list-wrapper">
          <ul>
            {currentAreas &&
              currentAreas.map((area) => {
                return (
                  <li key={area.practiceAreaId}>
                    <div
                      onClick={() => {
                        setNewPracticeArea(area.practiceAreaId);
                        handleRemove(area.practiceAreaId);
                      }}
                      className="practice-area-item current"
                    >
                      {area.name}
                    </div>
                  </li>
                );
              })}
            {allAreas &&
              allAreas.map((area) => {
                return (
                  <li key={area.practiceAreaId}>
                    <div
                      onClick={() => {
                        setNewPracticeArea(area.practiceAreaId);
                        handleAdd(area.practiceAreaId);
                      }}
                      className="practice-area-item"
                    >
                      {capitalize(area.name)}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default PracticeAreaToggle;
