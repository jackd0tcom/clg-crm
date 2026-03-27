import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { capitalizeCaseFilter } from "../../helpers/helperFunctions";

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
  // Used to determine which option gets the checkmark icon
  const [currentFilter, setCurrentFilter] = useState("updated-down");
  // Used to populate the button text, is an html element
  const [activeFilter, setActiveFilter] = useState("Last Updated");

  const fetchSettings = async (params) => {
    try {
      await axios.get("/api/getUserSettings").then((res) => {
        console.log(res.data);
        const filter = res.data.caseFilter;
        setCurrentFilter(filter);
        setActiveFilter(capitalizeCaseFilter(filter));
        if (filter === "updated-down") {
          setCases(nonArchivedCases);
        }
        if (filter === "updated-up") {
          setCases(oldestFirst);
        }
        if (filter === "opened-up") {
          byDate(false);
        }
        if (filter === "opened-down") {
          byDate(true);
        }
        if (filter === "all") {
          setCases(allCases);
        }
        if (filter === "archived") {
          setCases(archivedCases);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handles blur
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

  // Only filter option with a handler function, sorts the data here instead of in CaseList.jsx
  const byDate = (latest) => {
    if (latest) {
      const sortedCases = [...nonArchivedCases].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setCases(sortedCases);
    } else {
      const sortedCases = [...nonArchivedCases].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setCases(sortedCases);
    }
  };

  const handleFilterClick = async (filter) => {
    try {
      await axios
        .post("/api/updateUserSettings", {
          fieldName: "caseFilter",
          value: filter,
        })
        .then((res) => {
          console.log(res.data);
        });
    } catch (error) {
      console.log(error);
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
              handleFilterClick("updated-down");
              setActiveFilter(
                <span>
                  Last Updated{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-down"></i>
                </span>,
              );
              setCases(nonArchivedCases);
              setCurrentFilter("updated-down");
              setIsFiltering(false);
            }}
          >
            <span>
              Last Updated{" "}
              <i className="case-filter-icon fa-solid fa-arrow-down"></i>
            </span>
            {currentFilter === "updated-down" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              handleFilterClick("updated-up");
              setActiveFilter(
                <span>
                  Last Updated{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-up"></i>
                </span>,
              );
              setCases(oldestFirst);
              setCurrentFilter("updated-up");
              setIsFiltering(false);
            }}
          >
            {" "}
            <span>
              Last Updated{" "}
              <i className="case-filter-icon fa-solid fa-arrow-up"></i>
            </span>
            {currentFilter === "updated-up" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              handleFilterClick("opened-up");
              setActiveFilter(
                <span>
                  Date Opened{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-down"></i>
                </span>,
              );
              byDate(false);
              setCurrentFilter("opened-up");
              setIsFiltering(false);
            }}
          >
            <span>
              Date Opened{" "}
              <span className="case-filter-subtext">(new - old)</span>{" "}
            </span>
            {currentFilter === "opened-up" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              handleFilterClick("opened-down");
              setActiveFilter(
                <span>
                  Date Opened{" "}
                  <i className="case-filter-icon fa-solid fa-arrow-up"></i>
                </span>,
              );
              byDate(true);
              setCurrentFilter("opened-down");
              setIsFiltering(false);
            }}
          >
            {" "}
            <span>
              Date Opened{" "}
              <span className="case-filter-subtext">(old - new)</span>
            </span>
            {currentFilter === "opened-down" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              handleFilterClick("all");
              setActiveFilter("Show All");
              setCases(allCases);
              setCurrentFilter("all");
              setIsFiltering(false);
            }}
          >
            Show All{" "}
            {currentFilter === "all" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
          <div
            className="case-filter-dropdown-item"
            onClick={() => {
              handleFilterClick("archived");
              setActiveFilter("Show Archived");
              setCases(archivedCases);
              setCurrentFilter("archived");
              setIsFiltering(false);
            }}
          >
            Show Archived{" "}
            {currentFilter === "archived" && (
              <i className="case-filter-check fa-solid fa-check"></i>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CaseFilter;
