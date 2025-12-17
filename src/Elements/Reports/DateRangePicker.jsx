import "cally";

const DateRangePicker = ({ dateValue, setDateValue, setFilter, filter }) => {
  return (
    <div className="date-range-picker">
      <calendar-range
        value={dateValue}
        onchange={(e) => console.log(e.target.value)}
      >
        <calendar-month />
        <calendar-month offset={1} />
      </calendar-range>
    </div>
  );
};
export default DateRangePicker;
