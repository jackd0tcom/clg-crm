import { useState } from "react";
import DatePicker from "react-datepicker";

const FilterDateRangeSelector = ({ filter, setFilter }) => {
  const [showDatePicker, setShowDatePicker] = useState(true);
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [startDate, setStartDate] = useState(
    filter.dateRange.startDate || new Date(),
  );
  const [endDate, setEndDate] = useState(
    filter.dateRange.endDate || new Date(),
  );

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

  const nextMonth = () => {
    const newStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      1,
    );
    const newEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 2, 0);
    setStartDate(newStart);
    setEndDate(newEnd);
    setFilter({
      ...filter,
      dateRange: {
        startDate: newStart,
        endDate: newEnd,
      },
    });
  };

  const prevMonth = () => {
    const newStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth() - 1,
      1,
    );
    const newEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    setStartDate(newStart);
    setEndDate(newEnd);
    setFilter({
      ...filter,
      dateRange: {
        startDate: newStart,
        endDate: newEnd,
      },
    });
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
      <i
        id="date-range-arrow"
        onClick={() => prevMonth()}
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
        onClick={() => nextMonth()}
        className="fa-solid fa-angle-right"
      ></i>
    </div>
  );
};
export default FilterDateRangeSelector;
