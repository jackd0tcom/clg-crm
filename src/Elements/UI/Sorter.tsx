import { useEffect, useState, useRef } from "react";

interface props {
  filter: any;
  setFilter: any;
  options: any;
  direction: string;
  position: string;
}

const Sorter = ({ filter, setFilter, options, direction, position }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isFiltered = filter[options[0].sortHeading] !== "";
  const dropdownRef = useRef<HTMLInputElement>(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-sort-filter-button");
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
    <div className="order-sort-wrapper">
      <button
        className={
          !isFiltered
            ? "order-sort-filter-button"
            : "order-sort-filter-button order-sort-filtered"
        }
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fa-solid fa-up-down"></i>
        Sort
        {isFiltered && (
          <span
            className="order-sort-filter-x-wrapper"
            onClick={() => {
              setFilter({ ...filter, [options[0].sortHeading]: "" });
              setTimeout(() => {
                setShowDropdown(false);
              }, 50);
            }}
          >
            <i className="fa-solid fa-x order-sort-filter-x"></i>
          </span>
        )}
      </button>
      {isFiltered && (
        <button
          onClick={() => {
            filter[direction] === "up"
              ? setFilter({ ...filter, [direction]: "down" })
              : setFilter({ ...filter, [direction]: "up" });
          }}
          className="order-sort-direction"
        >
          {filter[direction] === "up" ? (
            <i className="fa-solid fa-arrow-down-short-wide"></i>
          ) : (
            <i className="fa-solid fa-arrow-up-short-wide"></i>
          )}
        </button>
      )}
      {showDropdown && (
        <div
          className={
            position === "left"
              ? "dropdown order-sort-dropdown"
              : "dropdown order-sort-dropdown right-positioning"
          }
          ref={dropdownRef}
        >
          {options.map((option: any) => {
            const isSelected = option.sortValue === filter[option.sortHeading];
            return (
              <div
                className="dropdown-item sorter-item"
                onClick={() => {
                  if (filter[option.sortHeading] !== option.sortValue) {
                    setFilter({
                      ...filter,
                      [option.sortHeading]: option.sortValue,
                    });
                  } else {
                    setFilter({
                      ...filter,
                      [option.sortHeading]: option.sortValue,
                    });
                  }
                  setShowDropdown(false);
                }}
              >
                {option.heading}
                {isSelected && <i className="fa-solid fa-check"></i>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Sorter;
