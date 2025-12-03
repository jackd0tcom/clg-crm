import { useState, useEffect, useRef } from "react";

const CaseFilter = ({
  setCases,
  originalCases,
  archivedCases,
  nonArchivedCases,
  allCases,
  oldestFirst,
}) => {
  const [isFiltering, setIsFiltering] = useState(false);
  const dropdownRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState(
    <span>
      Last Updated <i className="case-filter-icon fa-solid fa-arrow-up"></i>
    </span>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFiltering(false);
      }
    };
    if (isFiltering) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFiltering]);

  const byDate = (latest) => {
    if (latest) {
      const sortedCases = [...nonArchivedCases].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setCases(sortedCases);
    } else {
      const sortedCases = [...nonArchivedCases].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCases(sortedCases);
    }
  };

  return (
    <div className="case-filter-wrapper">
      <p className="sort-by">Sort By</p>
      <button
        className="case-filter-button"
        onClick={() =>
          !isFiltering ? setIsFiltering(true) : setIsFiltering(false)
        }
      >
        {activeFilter}
      </button>
      {isFiltering && (
        <div className="case-filter-dropdown-wrapper" ref={dropdownRef}>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter(
                <span>
                  Last Updated{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-up"></i>
                </span>
              );
              setCases(nonArchivedCases);
            }}
          >
            <span>
              Last Updated{" "}
              <i className="case-filter-icon fa-solid fa-arrow-up"></i>
            </span>
            {activeFilter.props.children[0] === "Last Updated" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter(
                <span>
                  Last Updated{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-down"></i>
                </span>
              );
              setCases(oldestFirst);
            }}
          >
            {" "}
            <span>
              Last Updated{" "}
              <i className="case-filter-icon fa-solid fa-arrow-down"></i>
            </span>
            {activeFilter === "updated-down" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter(
                <span>
                  Date Opened{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-up"></i>
                </span>
              );
              byDate(false);
            }}
          >
            {" "}
            <span>
              Date Opened{" "}
              <i className="case-filter-icon fa-solid fa-arrow-up"></i>
            </span>
            {activeFilter === "opened-up" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter(
                <span>
                  Date Opened{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-down"></i>
                </span>
              );
              byDate(true);
            }}
          >
            {" "}
            <span>
              Date Opened{" "}
              <i className="case-filter-icon fa-solid fa-arrow-down"></i>
            </span>
            {activeFilter === "opened-down" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter("Show Archived");
              setCases(archivedCases);
            }}
          >
            Show Archived{" "}
            {activeFilter === "archive" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              setActiveFilter("Show All");
              setCases(allCases);
            }}
          >
            Show All{" "}
            {activeFilter === "all" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CaseFilter;
