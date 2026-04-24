import { useState, useEffect, useRef } from "react";

const EntriesUserPicker = ({
  getAllEntries,
  setShowAllEntries,
  showAllEntries,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleShowAllEntries = () => {
    if (!showAllEntries) {
      getAllEntries();
      setTimeout(() => {
        setShowAllEntries(true);
      });
    } else setShowAllEntries(false);
  };
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
    <div className="entries-user-picker-wrapper">
      <button
        className="entries-user-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {!showAllEntries ? "My Entries" : "All Entries"}
      </button>
      {showDropdown && (
        <div className="dropdown" ref={dropdownRef}>
          <div className="dropdown-item" onClick={() => handleShowAllEntries()}>
            My Entries
          </div>
          <div className="dropdown-item" onClick={() => handleShowAllEntries()}>
            All Entries
          </div>
        </div>
      )}
    </div>
  );
};
export default EntriesUserPicker;
