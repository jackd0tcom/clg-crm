import DatePicker from "react-datepicker";
import { useState } from "react";

interface props {
  currentDate: any;
  onDateChange: any;
  clearable: boolean;
}

const UIDatePicker = ({ currentDate, onDateChange, clearable }: props) => {
  const [dueDate, setDueDate] = useState(currentDate);
  const [hover, setHover] = useState(false);

  return (
    <div
      className="date-picker-wrapper"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <i className="fa-solid fa-calendar-days"></i>
      <DatePicker
        selected={dueDate}
        isClearable={clearable}
        onChange={(date) => {
          setDueDate(date);
          onDateChange(date);
        }}
      />
    </div>
  );
};
export default UIDatePicker;
