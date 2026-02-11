import { useState, useEffect, useRef } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import ProjectPickerSearch from "./ProjectPickerSearch";
import Loader from "../UI/Loader";

const FilterProjectPicker = ({ filter, setFilter }) => {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
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
    getCasesWithTasks();
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
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="project-picker-wrapper">
      <button
        className={
          filter.caseIds.length > 0 || filter.taskIds.length > 0
            ? "filter-project-picker-button active-project-filter"
            : "filter-project-picker-button"
        }
        onClick={() => {
          showPicker ? setShowPicker(false) : setShowPicker(true);
        }}
      >
        Project
        {filter.caseIds.length > 0 || filter.taskIds.length > 0 ? (
          <i
            onClick={() => {
              setFilter({ ...filter, caseIds: [], taskIds: [] });
              setTimeout(() => {
                setShowPicker(false);
              }, 100);
            }}
            id="clear-filter-x"
            className="fa-solid fa-x"
          ></i>
        ) : (
          ""
        )}
      </button>
      {showPicker && (
        <div
          className="filter-project-picker-overlay-wrapper"
          ref={dropdownRef}
        >
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
                        !filter.caseIds.includes(caseItem.caseId)
                          ? "filter-project-picker-case-item"
                          : "filter-project-picker-case-item current-project"
                      }
                      onClick={() => {
                        if (filter.caseIds.includes(caseItem.caseId)) {
                          setFilter({
                            ...filter,
                            caseIds: filter.caseIds.filter(
                              (id) => id !== caseItem.caseId,
                            ),
                          });
                        } else {
                          setFilter({
                            ...filter,
                            caseIds: [...filter.caseIds, caseItem.caseId],
                          });
                        }
                      }}
                    >
                      <div className="filter-project-picker-item-title">
                        <i className="fa-solid fa-briefcase"></i>
                        <p>{caseItem.title}</p>
                      </div>
                      {filter.caseIds.includes(caseItem.caseId) && (
                        <i className="fa-solid fa-check"></i>
                      )}
                    </div>
                    <div className="project-picker-task-list-wrapper">
                      {caseItem.tasks &&
                        caseItem.tasks.map((task) => {
                          return (
                            <div
                              key={task.taskId}
                              className={
                                !filter.taskIds.includes(task.taskId)
                                  ? "filter-project-picker-case-item"
                                  : "filter-project-picker-case-item current-project"
                              }
                              onClick={() => {
                                if (filter.taskIds.includes(task.taskId)) {
                                  setFilter({
                                    ...filter,
                                    taskIds: filter.taskIds.filter(
                                      (id) => id !== task.taskId,
                                    ),
                                  });
                                } else {
                                  setFilter({
                                    ...filter,
                                    taskIds: [...filter.taskIds, task.taskId],
                                  });
                                }
                              }}
                            >
                              <div className="filter-project-picker-item-title">
                                <StatusIcon
                                  status={task.status}
                                  hasIcon={true}
                                  hasTitle={false}
                                  noBg={true}
                                />
                                <p>{task.title}</p>
                              </div>
                              {filter.taskIds.includes(task.taskId) && (
                                <i className="fa-solid fa-check"></i>
                              )}
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
export default FilterProjectPicker;
