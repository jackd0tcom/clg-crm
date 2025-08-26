import { useState, useEffect } from "react";

const CaseFilter = ({ cases, setCases, originalCases }) => {
  const [isLatest, setIsLatest] = useState(true);
  const [isPriority, setIsPriority] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Initialize cases to show only non-archived by default
  useEffect(() => {
    if (originalCases && originalCases.length > 0) {
      const nonArchivedCases = originalCases.filter((a) => !a.isArchived);
      setCases(nonArchivedCases);
    }
  }, [originalCases, setCases]);

  const byDate = () => {
    const filteredCases = showArchived 
      ? originalCases.filter((a) => a.isArchived)
      : originalCases.filter((a) => !a.isArchived);

    if (isLatest) {
      console.log("is latest - sorting newest first");
      const sortedCases = [...filteredCases].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      console.log("Sorted cases:", sortedCases);
      setCases(sortedCases);
      setIsLatest(false);
    } else {
      console.log("is not latest - sorting oldest first");
      const sortedCases = [...filteredCases].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log("Sorted cases:", sortedCases);
      setCases(sortedCases);
      setIsLatest(true);
    }
  };

  const byPriority = () => {
    const filteredCases = showArchived 
      ? originalCases.filter((a) => a.isArchived)
      : originalCases.filter((a) => !a.isArchived);

    if (isPriority) {
      console.log("is priority - sorting highest priority first");
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const sortedCases = [...filteredCases].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      setCases(sortedCases);
      setIsPriority(false);
    } else {
      console.log("is not priority - sorting lowest priority first");
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const sortedCases = [...filteredCases].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      setCases(sortedCases);
      setIsPriority(true);
    }
  };

  const handleArchived = () => {
    if (showArchived) {
      console.log("showing non-archived cases");
      const nonArchivedCases = [...originalCases].filter((a) => !a.isArchived);
      setCases(nonArchivedCases);
      setShowArchived(false);
    } else {
      console.log("showing archived cases");
      const archivedCases = [...originalCases].filter((a) => a.isArchived);
      setCases(archivedCases);
      setShowArchived(true);
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
      <div className="case-filter-section">
        <p
          onClick={() => {
            handleArchived();
          }}
        >
          {!showArchived ? "Show Archived" : "Hide Archived"}
        </p>
      </div>
    </div>
  );
};
export default CaseFilter;
