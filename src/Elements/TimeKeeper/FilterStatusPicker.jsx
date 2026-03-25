import { useState, useEffect, useRef } from "react";

const FilterStatusPicker = ({ filter, setFilter }) => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".filter-status-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="filter-status-picker">
      <button
        className={
          selectedStatus === "all"
            ? "dropdown-item filter-status-button"
            : `dropdown-item filter-status-button active-filter-status`
        }
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Status
        {selectedStatus !== "all" && (
          <i
            onClick={() => {
              setSelectedStatus("all");
              setFilter({ ...filter, paidStatus: "all" });
              setTimeout(() => {
                setShowDropdown(false);
              }, 100);
            }}
            id="clear-filter-x"
            className="fa-solid fa-x"
          ></i>
        )}
      </button>
      {showDropdown && (
        <div className="filter-status-dropdown dropdown" ref={dropdownRef}>
          <div
            className={
              selectedStatus === "all"
                ? "dropdown-item filter-status-item selected-status-item"
                : "dropdown-item filter-status-item"
            }
            onClick={() => {
              setSelectedStatus("all");
              setFilter({
                ...filter,
                paidStatus: "all",
              });
              setShowDropdown(false);
            }}
          >
            All
            {selectedStatus === "all" && <i className="fa-solid fa-check"></i>}
          </div>
          <div
            className={
              selectedStatus === "draft"
                ? "dropdown-item filter-status-item selected-status-item"
                : "dropdown-item filter-status-item"
            }
            onClick={() => {
              setSelectedStatus("draft");
              setFilter({
                ...filter,
                paidStatus: "draft",
              });
              setShowDropdown(false);
            }}
          >
            Unpaid
            {selectedStatus === "draft" && (
              <i className="fa-solid fa-check"></i>
            )}
          </div>
          <div
            className={
              selectedStatus === "posted"
                ? "dropdown-item filter-status-item selected-status-item"
                : "dropdown-item filter-status-item"
            }
            onClick={() => {
              setSelectedStatus("posted");
              setFilter({
                ...filter,
                paidStatus: "posted",
              });
              setShowDropdown(false);
            }}
          >
            Posted
            {selectedStatus === "posted" && (
              <i className="fa-solid fa-check"></i>
            )}
          </div>
          <div
            className={
              selectedStatus === "paid"
                ? "dropdown-item filter-status-item selected-status-item"
                : "dropdown-item filter-status-item"
            }
            onClick={() => {
              setSelectedStatus("paid");
              setFilter({
                ...filter,
                paidStatus: "paid",
              });
              setShowDropdown(false);
            }}
          >
            Paid
            {selectedStatus === "paid" && <i className="fa-solid fa-check"></i>}
          </div>
        </div>
      )}
    </div>
  );
};
export default FilterStatusPicker;
