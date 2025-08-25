import { useState } from "react";

const CaseFilter = ({ cases, setCases, originalCases }) => {
  const [isLatest, setIsLatest] = useState(true);
  const [isPriority, setIsPriority] = useState(true);
  
  const byDate = () => {
    if (isLatest) {
      console.log("is latest - sorting newest first");
      const sortedCases = [...originalCases].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      console.log("Sorted cases:", sortedCases);
      setCases(sortedCases);
      setIsLatest(false);
    } else {
      console.log("is not latest - sorting oldest first");
      const sortedCases = [...originalCases].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log("Sorted cases:", sortedCases);
      setCases(sortedCases);
      setIsLatest(true);
    }
  };

  const byPriority = () => {
    if (isPriority) {
      console.log("is priority - sorting highest priority first");
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const sortedCases = [...originalCases].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      setCases(sortedCases);
      setIsPriority(false);
    } else {
      console.log("is not priority - sorting lowest priority first");
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const sortedCases = [...originalCases].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      setCases(sortedCases);
      setIsPriority(true);
    }
  };

  return (
    <div className="case-filter-wrapper">
      <div className="case-filter-section">
        <p onClick={() => byDate()}>
          Date Opened{" "}
          <span>
            {isLatest ? (
              <i className="fa-solid fa-arrow-up"></i>
            ) : (
              <i className="fa-solid fa-arrow-down"></i>
            )}
          </span>
        </p>
      </div>
      <div className="case-filter-section">
        <p onClick={() => byPriority()}>
          Priority{" "}
          <span>
            {isPriority ? (
              <i className="fa-solid fa-arrow-up"></i>
            ) : (
              <i className="fa-solid fa-arrow-down"></i>
            )}
          </span>
        </p>
      </div>
    </div>
  );
};
export default CaseFilter;
