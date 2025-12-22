import "cally";
import { useRef, useEffect } from "react";

const DateRangePicker = ({
  dateValue,
  setDateValue,
  setFilter,
  filter,
  formatCallyDate,
  isChangingDate,
  setIsChangingDate,
  quickRange,
  setQuickRange,
}) => {
  const today = new Date().toISOString();
  const dropdownRef = useRef(null);

  // Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsChangingDate(false);
      }
    };

    if (isChangingDate) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChangingDate]);

  //   Formats date to work with filter - adds time
  const formatDate = (date) => {
    const dateArr = date.split("/");
    const startDate = `${dateArr[0]}T12:00:00Z`;
    const endDate = `${dateArr[1]}T12:00:00Z`;
    return {
      start: startDate,
      end: endDate,
    };
  };

  return (
    <div className="date-range-picker" ref={dropdownRef}>
      <div className="quick-range-wrapper">
        <p
          className={quickRange === "This Month" ? "current-quick-range" : ""}
          onClick={() => setQuickRange("This Month")}
        >
          This Month
        </p>
        <p
          className={quickRange === "This Quarter" ? "current-quick-range" : ""}
          onClick={() => setQuickRange("This Quarter")}
        >
          This Quarter
        </p>
        <p
          className={quickRange === "This Year" ? "current-quick-range" : ""}
          onClick={() => setQuickRange("This Year")}
        >
          This Year
        </p>
      </div>
      <calendar-range
        value={dateValue}
        min="2025-11-01"
        today={today}
        onchange={(e) => {
          setDateValue(formatCallyDate(e.target.value));
          setFilter({
            ...filter,
            dateRange: formatDate(e.target.value),
          });
        }}
      >
        <calendar-month />
        <calendar-month offset={1} />
      </calendar-range>
    </div>
  );
};
export default DateRangePicker;
