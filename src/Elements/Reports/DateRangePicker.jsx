import "cally";

const DateRangePicker = ({ dateValue, setDateValue, setFilter, filter }) => {
  const today = new Date().toISOString();
  return (
    <div className="date-range-picker">
      <calendar-range
        value={dateValue}
        min="2025-11-01"
        today={today}
        onchange={(e) => {
          const dateArr = e.target.value.split("/");
          const startDate = `${dateArr[0]}T12:00:00Z`;
          const endDate = `${dateArr[1]}T12:00:00Z`;
          setFilter({
            ...filter,
            dateRange: { start: startDate, end: endDate },
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
