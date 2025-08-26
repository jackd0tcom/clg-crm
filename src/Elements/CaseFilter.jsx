import { useState, useEffect } from "react";

const CaseFilter = ({
  cases,
  setCases,
  originalCases,
  showArchived,
  setShowArchived,
}) => {
  const [isLatest, setIsLatest] = useState(true);
  const [isPriority, setIsPriority] = useState(true);
  const [nonArchivedCases, setNonArchivedCases] = useState([]);
  const [active, setActive] = useState("updated");

  // Initialize nonArchivedCases for the "Last Updated" filter
  useEffect(() => {
    if (originalCases && originalCases.length > 0) {
      // Set nonArchivedCases for the "Last Updated" filter
      const list = originalCases.filter((a) => !a.isArchived);
      setNonArchivedCases(list);
    }
  }, [originalCases]);

  // Update active state when showArchived changes
  useEffect(() => {
    if (showArchived) {
      setActive("archive");
    } else {
      setActive("updated");
    }
  }, [showArchived]);

  const byDate = () => {
    const filteredCases = showArchived
      ? originalCases.filter((a) => a.isArchived)
      : originalCases.filter((a) => !a.isArchived);

    if (isLatest) {
      const sortedCases = [...filteredCases].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setCases(sortedCases);
      setIsLatest(false);
    } else {
      const sortedCases = [...filteredCases].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCases(sortedCases);
      setIsLatest(true);
    }
  };

  const byPriority = () => {
    const filteredCases = showArchived
      ? originalCases.filter((a) => a.isArchived)
      : originalCases.filter((a) => !a.isArchived);

    if (isPriority) {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const sortedCases = [...filteredCases].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      setCases(sortedCases);
      setIsPriority(false);
    } else {
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
      const nonArchivedCases = [...originalCases].filter((a) => !a.isArchived);
      setCases(nonArchivedCases);
      setShowArchived(false);
      // setActive("updated") is now handled by useEffect
    } else {
      const archivedCases = [...originalCases].filter((a) => a.isArchived);
      setCases(archivedCases);
      setShowArchived(true);
      // setActive("archive") is now handled by useEffect
    }
  };

  return (
    <div className="case-filter-wrapper">
      <div
        className={`case-filter-section ${
          active === "updated" && "active-filter"
        }`}
      >
        <p
          onClick={() => {
            setCases(nonArchivedCases);
            setActive("updated");
          }}
        >
          Last Updated{" "}
        </p>
      </div>
      <div
        className={`case-filter-section ${
          active === "date" && "active-filter"
        }`}
      >
        <p
          onClick={() => {
            byDate();
            setActive("date");
          }}
        >
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
      <div
        className={`case-filter-section ${
          active === "priority" && "active-filter"
        }`}
      >
        <p
          onClick={() => {
            byPriority();
            setActive("priority");
          }}
        >
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
      <div
        className={`case-filter-section ${
          active === "archive" && "active-filter"
        }`}
      >
        <p
          onClick={() => {
            handleArchived();
            setActive("archive");
          }}
        >
          {!showArchived ? "Show Archived" : "Hide Archived"}
        </p>
      </div>
    </div>
  );
};
export default CaseFilter;
