import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Loader from "../UI/Loader";
import ProjectPickerSearch from "../TimeKeeper/ProjectPickerSearch";

const TaskCaseToggle = ({
  currentCase,
  setCurrentCase,
  taskId,
  refreshTaskData,
  refreshTaskActivityData,
  isMovingCase,
  setIsMovingCase,
}) => {
  const [allCases, setAllCases] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      axios.get("/api/getCases").then((res) => {
        setAllCases(res.data.cases);
        setFilteredData(res.data.cases);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMovingCase(false);
      }
    };

    if (isMovingCase) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMovingCase]);

  const updateCase = (caseId) => {
    try {
      axios
        .post("/api/updateTask", { taskId, fieldName: "caseId", value: caseId })
        .then((res) => {
          if (res.status === 200) {
            // Fetch the case data to get the case title
            axios.get(`/api/getCase/${caseId}`).then((caseRes) => {
              setCurrentCase(caseRes.data);
            });
            refreshTaskData();
            refreshTaskActivityData();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="toggle-overlay task-case-toggle" ref={dropdownRef}>
      <div className="task-case-toggle-wrapper">
        <div className="task-case-list-wrapper">
          <div className="task-case-list-search-wrapper">
            <ProjectPickerSearch
              originalData={allCases}
              setFilteredData={setFilteredData}
            />
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            filteredData?.length > 0 &&
            filteredData?.map((current) => {
              return (
                <div key={current.caseId}>
                  <div
                    onClick={() => {
                      updateCase(current.caseId);
                      setIsMovingCase(false);
                    }}
                    className={`task-case-item ${
                      currentCase && current.caseId === currentCase.caseId
                        ? "selected"
                        : ""
                    }`}
                  >
                    {current.title}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default TaskCaseToggle;
