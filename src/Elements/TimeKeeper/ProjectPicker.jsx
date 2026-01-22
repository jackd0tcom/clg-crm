import { useState, useEffect, useRef } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import ProjectPickerSearch from "./ProjectPickerSearch";

const ProjectPicker = ({
  casesWithTasks,
  entry,
  setEntry,
  showCaseTaskPicker,
  setShowCaseTaskPicker,
}) => {
  const originalData = [...casesWithTasks];
  const [filteredData, setFilteredData] = useState(casesWithTasks);
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  // Update filteredData when casesWithTasks changes
  useEffect(() => {
    setFilteredData(casesWithTasks);
  }, [casesWithTasks]);

  return (
    <div className="project-picker-wrapper">
      <div className="project-picker-header">
        <ProjectPickerSearch
          originalData={originalData}
          filteredData={filteredData}
          setFilteredData={setFilteredData}
        />
      </div>
      {filteredData.map((caseItem) => {
        return (
          <>
            <div
              key={caseItem.caseId}
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
          </>
        );
      })}
    </div>
  );
};
export default ProjectPicker;
