import { useState, useEffect } from "react";
import axios from "axios";
import StatusIcon from "../Task/StatusIcon";
import ProjectPickerSearch from "./ProjectPickerSearch";

const ProjectPicker = ({ casesWithTasks, entry, setEntry, dropDownRef }) => {
  const originalData = [...casesWithTasks];
  const [filteredData, setFilteredData] = useState(casesWithTasks);

  // Update filteredData when casesWithTasks changes
  useEffect(() => {
    setFilteredData(casesWithTasks);
  }, [casesWithTasks]);

  return (
    <div className="project-picker-wrapper" ref={dropDownRef}>
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
