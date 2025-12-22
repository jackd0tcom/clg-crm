import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { capitalize } from "../../helpers/helperFunctions";

const ReportPracticeAreaToggle = ({ filter, setFilter }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [rawAreas, setRawAreas] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch practice areas
  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getPracticeAreas").then((res) => {
          const alphabetizedAreas = res.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setRawAreas(alphabetizedAreas);
          setPracticeAreas(alphabetizedAreas);
        });
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, []);

  // Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const addArea = (newArea) => {
    // Add new area + existing selected areas to filter
    setFilter({ ...filter, practiceAreas: [...selectedAreas, newArea] });
    // Add new area to selected areas for mapping
    setSelectedAreas([...selectedAreas, newArea]);
    // Filter practiceAreas to remove newArea from array
    const unselectedAreas = practiceAreas.filter(
      (area) => area.name !== newArea.name
    );
    setPracticeAreas(unselectedAreas);
  };

  const removeArea = (newArea) => {
    // Filter selected areas to update filter and selectedAreas state
    const updatedSelectedAreas = selectedAreas.filter(
      (area) => area.name !== newArea.name
    );
    // Remove area from filter
    setFilter({ ...filter, practiceAreas: [...updatedSelectedAreas] });
    // Remove area from selected areas
    setSelectedAreas(updatedSelectedAreas);
    // Add removed area back to practiceAreas for mapping, alphabetizing first
    const updatedPracticeAreas = [...practiceAreas, newArea];
    const alphabetizedAreas = updatedPracticeAreas.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setPracticeAreas(alphabetizedAreas);
  };

  const clearAreas = () => {
    setFilter({ ...filter, practiceAreas: [] });
    setPracticeAreas(rawAreas);
    setSelectedAreas([]);
  };

  return (
    <div className="practice-area-toggle">
      <div
        onClick={() => (!isVisible ? setIsVisible(true) : setIsVisible(false))}
        className="practice-area-button"
      >
        <p>Practice Areas</p>
        {selectedAreas.length > 0 && (
          <div onClick={() => clearAreas()} className="clear-areas-button">
            x
          </div>
        )}
      </div>
      {isVisible && (
        <div className="practice-area-dropdown" ref={dropdownRef}>
          {selectedAreas?.length >= 0 &&
            selectedAreas.map((area) => (
              <div
                onClick={() => removeArea(area)}
                key={area.practiceAreaId}
                className="practice-area-item selected-area"
              >
                {capitalize(area.name)}
                <div className="checkmark-wrapper active-wrapper">
                  <i id="practice-area-check" className="fa-solid fa-check"></i>
                </div>
              </div>
            ))}
          {practiceAreas?.length > 0 &&
            practiceAreas.map((area) => (
              <div
                onClick={() => addArea(area)}
                key={area.practiceAreaId}
                className="practice-area-item"
              >
                {capitalize(area.name)}
                <div className="checkmark-wrapper"></div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default ReportPracticeAreaToggle;
