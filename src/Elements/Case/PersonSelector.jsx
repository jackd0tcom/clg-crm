import { useState, useEffect, useRef, useMemo } from "react";

const PersonSelector = ({ peopleList, people, handleSelectExisting }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".add-person-page-button");
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

  const filteredPeople = useMemo(() => {
    let data = peopleList;

    const searchTerm = search.trim().toLowerCase();

    // Filter out for search
    data = data.filter((person) => {
      if (person.firstName?.toLowerCase().includes(searchTerm)) return true;
      if (person.lastName?.toLowerCase().includes(searchTerm)) return true;
      if (person.address?.toLowerCase().includes(searchTerm)) return true;
      if (person.city?.toLowerCase().includes(searchTerm)) return true;
      if (person.zip?.includes(searchTerm)) return true;
      if (person.SSN?.includes(searchTerm)) return true;
      if (person.phone?.includes(searchTerm)) return true;
      if (person.email?.toLowerCase().includes(searchTerm)) return true;
    });

    return data;
  }, [search]);

  return (
    <div className="person-selector-wrapper">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="add-person-page-button choose-person-button"
      >
        <i class="fa-solid fa-arrow-pointer" id="choose-person-icon"></i>
        Choose an Existing Person
      </button>
      {showDropdown && (
        <div className="dropdown person-selector-dropdown" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            className="person-search"
          />
          {filteredPeople?.length > 0 &&
            filteredPeople.map((person) => (
              <div
                className="dropdown-item"
                onClick={() => handleSelectExisting(person.personId)}
              >
                {person.firstName} {person.lastName}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default PersonSelector;
