import { useState, useEffect, useRef } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import ProjectPickerSearch from "./ProjectPickerSearch";
import Loader from "../UI/Loader";

const ProjectPicker = ({
  entry,
  setEntry,
  showCaseTaskPicker,
  setShowCaseTaskPicker,
}) => {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  const getCasesWithTasks = async () => {
    try {
      await axios.get("/api/getCasesWithTasks").then((res) => {
        if (!res.statusText === "OK") {
          console.log(error);
          return;
        }
        setOriginalData(res.data);
        setFilteredData(res.data);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    try {
      getCasesWithTasks();
    } catch (error) {
      console.log(error);
    }
  }, []);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".project-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowCaseTaskPicker(false);
      }
    };

    if (showCaseTaskPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCaseTaskPicker]);

  return (
    <div className="project-picker-wrapper">
      <button
        className="project-picker-button"
        onClick={() => {
          showCaseTaskPicker
            ? setShowCaseTaskPicker(false)
            : setShowCaseTaskPicker(true);
        }}
      >
        {!entry.currentTitle ? "Choose Project" : entry.currentTitle}
      </button>
      {showCaseTaskPicker && (
        <div className="project-picker-overlay-wrapper" ref={dropdownRef}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="project-picker-header">
                <ProjectPickerSearch
                  originalData={originalData}
                  filteredData={filteredData}
                  setFilteredData={setFilteredData}
                />
              </div>
              {filteredData.map((caseItem) => {
                return (
                  <div key={caseItem.caseId}>
                    <div
                      className={
                        entry.caseId !== caseItem.caseId
                          ? "project-picker-case-item"
                          : "project-picker-case-item current-project"
                      }
                      onClick={() => {
                        if (entry.caseId === caseItem.caseId) {
                          setEntry({
                            ...entry,
                            caseId: null,
                            taskId: null,
                            currentTitle: null,
                          });
                        } else {
                          setEntry({
                            ...entry,
                            taskId: null,
                            caseId: caseItem.caseId,
                            currentTitle: caseItem.title,
                          });
                        }
                        setShowCaseTaskPicker(false);
                      }}
                    >
                      <i className="fa-solid fa-briefcase"></i>
                      <p>{caseItem.title}</p>
                    </div>
                    <div className="project-picker-task-list-wrapper">
                      {caseItem.tasks &&
                        caseItem.tasks.map((task) => {
                          return (
                            <div
                              key={task.taskId}
                              className={
                                entry.taskId !== task.taskId
                                  ? "project-picker-case-item"
                                  : "project-picker-case-item current-project"
                              }
                              onClick={() => {
                                if (entry.taskId === task.taskId) {
                                  setEntry({
                                    ...entry,
                                    taskId: null,
                                    caseId: null,
                                    currentTitle: null,
                                  });
                                } else {
                                  setEntry({
                                    ...entry,
                                    taskId: task.taskId,
                                    caseId: null,
                                    currentTitle: task.title,
                                  });
                                }
                                setShowCaseTaskPicker(false);
                              }}
                            >
                              <StatusIcon
                                status={task.status}
                                hasIcon={true}
                                hasTitle={false}
                                noBg={true}
                              />
                              <p>{task.title}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default ProjectPicker;
