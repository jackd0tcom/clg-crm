import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";

const TaskCaseToggle = ({
  currentCase,
  setCurrentCase,
  taskId,
  refreshTaskData,
  refreshTaskActivityData,
  isMovingCase,
  setIsMovingCase,
}) => {
  const [allCases, setAllCases] = useState();
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      axios.get("/api/getCases").then((res) => {
        setAllCases(res.data);
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
    <div className="toggle-overlay" ref={dropdownRef}>
      <div className="task-case-toggle-wrapper">
        <div className="task-case-list-wrapper">
          <p className="task-case-toggle-heading">Assign to case:</p>
          {allCases &&
            allCases.map((current) => {
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
            })}
        </div>
      </div>
    </div>
  );
};
export default TaskCaseToggle;
