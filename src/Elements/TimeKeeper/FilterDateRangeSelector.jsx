import { useState } from "react";
import DatePicker from "react-datepicker";

const FilterDateRangeSelector = ({ filter, setFilter }) => {
  const [showDatePicker, setShowDatePicker] = useState(true);
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
    setFilter({
      ...filter,
      dateRange: {
        startDate: start,
        endDate: end,
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
        />
      )}
    </div>
  );
};
export default FilterDateRangeSelector;
