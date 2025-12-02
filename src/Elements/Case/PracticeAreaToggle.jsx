import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { capitalize } from "../../helpers/helperFunctions";
import NewPracticeArea from "./NewPracticeArea";

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
  const [allAreas, setAllAreas] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      axios.get("/api/getPracticeAreas").then((res) => {
        const all = res.data.sort((a, b) => a.name.localeCompare(b.name));
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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete("/api/removePracticeArea", {
        data: { id },
      });
      if (res.status === 200) {
        setAllAreas((prev) => prev.filter((a) => a.name !== res.data.name));
        setCurrentAreas((prev) => prev.filter((a) => a.name !== res.data.name));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="toggle-overlay" ref={dropdownRef}>
      <div className="practice-area-toggle-wrapper">
        <div className="practice-area-list-wrapper">
          <div className="practice-area-list-head">
            <p className="practice-area-toggle-heading">Practice Areas</p>
            <i
              id="edit-areas"
              className={!editing ? "fa-solid fa-pen" : "fa-solid fa-check"}
              onClick={() => {
                if (editing) {
                  setEditing(false);
                } else setEditing(true);
              }}
            ></i>
          </div>
          {!editing &&
            currentAreas &&
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
                      if (!editing) {
                        setNewPracticeArea(area.practiceAreaId);
                        handleAdd(area.practiceAreaId);
                        setIsAddingArea(false);
                      }
                    }}
                    className="practice-area-item"
                  >
                    {capitalize(area.name)}
                    {editing && (
                      <i
                        onClick={() => {
                          handleDelete(area.practiceAreaId);
                        }}
                        id="delete-area"
                        className="fa-solid fa-trash"
                      ></i>
                    )}
                  </div>
                </div>
              );
            })}
          {!editing && allAreas && !creating ? (
            <div
              className="practice-area-item"
              onClick={() => setCreating(true)}
            >
              Add Practice Area
              <i className="fa-solid fa-plus"></i>
            </div>
          ) : (
            !editing && (
              <NewPracticeArea
                setAllAreas={setAllAreas}
                creating={creating}
                setCreating={setCreating}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default PracticeAreaToggle;
