import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import {
  firstDayOfWeek,
  lastDayOfTheWeek,
} from "../../helpers/helperFunctions";

const FilterDateRangeSelector = ({ filter, setFilter }) => {
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [quickSelect, setQuickSelect] = useState("This Month");
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const dropdownRef = useRef(null);
  const [startDate, setStartDate] = useState(
    filter.dateRange.startDate || new Date(),
  );
  const [endDate, setEndDate] = useState(
    filter.dateRange.endDate || new Date(),
  );

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".project-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowQuickSelect(false);
      }
    };

    if (showQuickSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuickSelect]);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleCalendarClose = () => {
    setFilter({
      ...filter,
      dateRange: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  };

  const handleQuickSelect = (value) => {
    setQuickSelect(value);
    setShowQuickSelect(false);

    if (value === "This Week") {
      const start = firstDayOfWeek(now, 1);
      const end = lastDayOfTheWeek(now, 0);
      setStartDate(start);
      setEndDate(end);
      setFilter({ ...filter, dateRange: { startDate: start, endDate: end } });
    }
    if (value === "This Month") {
      setStartDate(firstDay);
      setEndDate(lastDay);
      setFilter({
        ...filter,
        dateRange: { startDate: firstDay, endDate: lastDay },
      });
    }
    if (value === "This Quarter") {
      const start = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
      const end = new Date(
        currentYear,
        Math.floor(currentMonth / 3) * 3 + 3,
        0,
      );
      setStartDate(start);
      setEndDate(end);
      setFilter({ ...filter, dateRange: { startDate: start, endDate: end } });
    }
    if (value === "This Year") {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      setStartDate(start);
      setEndDate(end);
      setFilter({ ...filter, dateRange: { startDate: start, endDate: end } });
    }
    if (value === "Last Week") {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      setStartDate(start);
      setEndDate(end);
      setFilter({ ...filter, dateRange: { startDate: start, endDate: end } });
    }
  };

  const increment = () => {
    let newStart = new Date(startDate);
    let newEnd = new Date(endDate);
    if (quickSelect === "This Week") {
      newStart.setDate(newStart.getDate() + 7);
      newEnd.setDate(newEnd.getDate() + 7);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    if (quickSelect === "This Month") {
      newStart.setMonth(newStart.getMonth() + 1);
      newEnd.setMonth(newEnd.getMonth() + 1);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    if (quickSelect === "This Quarter") {
      newStart.setMonth(newStart.getMonth() + 3);
      const quarterEnd = new Date(
        newStart.getFullYear(),
        newStart.getMonth() + 3,
        0,
      );
      setStartDate(newStart);
      setEndDate(quarterEnd);
      newEnd = quarterEnd;
    }
    if (quickSelect === "This Year") {
      newStart.setFullYear(newStart.getFullYear() + 1);
      newEnd.setFullYear(newEnd.getFullYear() + 1);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    setFilter({
      ...filter,
      dateRange: { startDate: newStart, endDate: newEnd },
    });
    return;
  };

  const decrement = () => {
    let newStart = new Date(startDate);
    let newEnd = new Date(endDate);
    if (quickSelect === "This Week") {
      newStart.setDate(newStart.getDate() - 7);
      newEnd.setDate(newEnd.getDate() - 7);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    if (quickSelect === "This Month") {
      newStart.setMonth(newStart.getMonth() - 1);
      newEnd.setMonth(newEnd.getMonth() - 1);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    if (quickSelect === "This Quarter") {
      newStart.setMonth(newStart.getMonth() - 3);
      const quarterEnd = new Date(
        newStart.getFullYear(),
        newStart.getMonth() + 3,
        0,
      );
      setStartDate(newStart);
      setEndDate(quarterEnd);
      newEnd = quarterEnd;
    }
    if (quickSelect === "This Year") {
      newStart.setFullYear(newStart.getFullYear() - 1);
      newEnd.setFullYear(newEnd.getFullYear() - 1);
      setStartDate(newStart);
      setEndDate(newEnd);
    }
    setFilter({
      ...filter,
      dateRange: { startDate: newStart, endDate: newEnd },
    });
    return;
  };

  const CustomInput = ({ className, onClick, value }) => {
    return (
      <button className={className} onClick={onClick}>
        {value}
      </button>
    );
  };

  return (
    <div className="filter-date-range-selector-wrapper">
      <button
        onClick={() =>
          showQuickSelect ? setShowQuickSelect(false) : setShowQuickSelect(true)
        }
        className="quick-select-button"
      >
        {quickSelect}
      </button>
      {showQuickSelect && (
        <div className="quick-select-wrapper" ref={dropdownRef}>
          <div
            onClick={() => handleQuickSelect("This Week")}
            className={
              quickSelect === "This Week"
                ? "quick-select-item current-quick-select"
                : "quick-select-item"
            }
          >
            This Week
          </div>
          <div
            onClick={() => handleQuickSelect("This Month")}
            className={
              quickSelect === "This Month"
                ? "quick-select-item current-quick-select"
                : "quick-select-item"
            }
          >
            This Month
          </div>
          <div
            onClick={() => handleQuickSelect("This Quarter")}
            className={
              quickSelect === "This Quarter"
                ? "quick-select-item current-quick-select"
                : "quick-select-item"
            }
          >
            This Quarter
          </div>
          <div
            onClick={() => handleQuickSelect("This Year")}
            className={
              quickSelect === "This Year"
                ? "quick-select-item current-quick-select"
                : "quick-select-item"
            }
          >
            This Year
          </div>
        </div>
      )}
      <i
        id="date-range-arrow"
        onClick={() => decrement()}
        className="fa-solid fa-angle-left"
      ></i>
      {showDatePicker && (
        <DatePicker
          swapRange
          selected={startDate}
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
          selectsRange
          customInput={
            <CustomInput className="time-keeper-filter-date-button" />
          }
          monthsShown={2}
          onCalendarClose={handleCalendarClose}
          dateFormat="MMM d yyyy"
        />
      )}
      <i
        id="date-range-arrow"
        onClick={() => increment()}
        className="fa-solid fa-angle-right"
      ></i>
    </div>
  );
};
export default FilterDateRangeSelector;
