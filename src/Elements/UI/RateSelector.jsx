import { useState, useEffect, useRef } from "react";

const RateSelector = ({
  user,
  rates,
  handleUpdateUser,
  handleUpdateEntry,
  entry,
  isAdminPage,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const rateTitle =
    rates?.find((rate) =>
      entry ? rate.rateId === entry.rateId : rate.rateId === user.rateId,
    )?.rateTitle ?? "Select a rate";

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".rate-selector-button");
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
    <div className="rate-selector relative">
      <button
        className="rate-selector-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        $ {rateTitle}
      </button>
      {showDropdown && (
        <div className="dropdown rate-selector-dropdown" ref={dropdownRef}>
          {rates?.map((rate) => (
            <div
              onClick={() => {
                if (isAdminPage) {
                  handleUpdateUser("rateId", rate.rateId, user.userId);
                } else handleUpdateEntry(rate.rateId);
                setShowDropdown(false);
              }}
              className="dropdown-item"
            >
              {rate.rateTitle}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default RateSelector;
