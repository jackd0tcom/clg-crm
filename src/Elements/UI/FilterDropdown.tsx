import { useEffect, useState, useRef } from "react";
import ProfilePic from "./ProfilePic";
import { capitalize } from "../../helpers/helperFunctions";

interface props {
  heading: string;
  array: boolean;
  options: any;
  filter: any;
  setFilter: any;
}

const FilterDropdown = ({
  heading,
  options,
  array,
  filter,
  setFilter,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const [showFilter, setShowFilter] = useState(false);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-filter-button");
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

  const isActive = array
    ? filter[heading.toLowerCase()]?.length > 0
    : filter[heading.toLowerCase()] !== 0;

  return (
    <div className="order-filter">
      <div className="order-filter-dropdown-wrapper">
        <button
          className={
            isActive
              ? "order-filter-button active-filter"
              : "order-filter-button"
          }
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseEnter={() => setShowFilter(true)}
          onMouseLeave={() => setShowFilter(false)}
        >
          {heading}
          {!isActive && (
            <div
              className={
                showFilter ? "filter-icon-wrapper" : "filter-icon-wrapper"
              }
            >
              <i className="fa-solid fa-sliders filter-icon"></i>
            </div>
          )}
          {isActive && (
            <span
              className="order-filter-x-wrapper"
              onClick={() => {
                array
                  ? setFilter({
                      ...filter,
                      [heading.toLowerCase()]: [],
                    })
                  : setFilter({
                      ...filter,
                      [heading.toLowerCase()]: 0,
                    });
                setTimeout(() => {
                  setShowDropdown(false);
                }, 50);
              }}
            >
              <i className="order-filter-x fa-solid fa-x"></i>
            </span>
          )}
        </button>
        {showDropdown && (
          <div className="dropdown" ref={dropdownRef}>
            {options.map((option: any) => {
              let isSelected = false;
              if (array) {
                isSelected = filter[heading.toLowerCase()]?.some(
                  (item: any) => item.id === option.id,
                );
              } else isSelected = option.id === filter[heading.toLowerCase()];
              return (
                <div
                  onClick={() => {
                    if (!array) {
                      setFilter({
                        ...filter,
                        [heading.toLowerCase()]: option.id,
                      });
                    } else {
                      const cleanFilter = filter[heading.toLowerCase()].filter(
                        (item: any) => item.id !== option.id,
                      );
                      isSelected
                        ? setFilter({
                            ...filter,
                            [heading.toLowerCase()]: cleanFilter,
                          })
                        : setFilter({
                            ...filter,
                            [heading.toLowerCase()]: [
                              ...filter[heading.toLowerCase()],
                              option,
                            ],
                          });
                    }
                  }}
                  className="dropdown-item order-filter-dropdown-item"
                >
                  <span className="order-filter-dropdown-span">
                    {option.profilePic && (
                      <ProfilePic src={option.profilePic} />
                    )}
                    {capitalize(option.title) ?? ""}
                  </span>
                  {isSelected && <i className="fa-solid fa-check"></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default FilterDropdown;
