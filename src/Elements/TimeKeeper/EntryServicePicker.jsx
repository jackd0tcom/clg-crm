import { useState, useEffect, useRef } from "react";

const EntryServicePicker = ({ entryServices, entry, setEntry }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(
        ".entry-service-picker-button",
      );
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

  const handleSelect = (service) => {
    setEntry({ ...entry, entryServiceId: service?.entryServiceId });
    setShowDropdown(false);
  };

  const currentEntryTitle = entry.entryServiceId
    ? (entryServices?.find(
        (service) => service.entryServiceId === entry.entryServiceId,
      ).serviceTitle ?? "")
    : "Pick a service";
  return (
    <div className="entry-service-picker relative">
      <div className="service-picker-wrapper">
        <button
          className="entry-service-picker-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {currentEntryTitle}
        </button>
        <input
          type="text"
          className="entry-service-notes"
          placeholder="Description"
          onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
        />
      </div>
      {showDropdown && (
        <div className="dropdown" ref={dropdownRef}>
          {entryServices?.map((service) => (
            <div
              className="dropdown-item"
              onClick={() => handleSelect(service)}
            >
              {service.serviceTitle}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default EntryServicePicker;
