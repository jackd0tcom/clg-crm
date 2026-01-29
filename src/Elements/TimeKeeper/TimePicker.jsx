import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { getDuration } from "../../helpers/helperFunctions";

const TimePicker = ({
  entry,
  setEntry,
  duration,
  setDuration,
  setShowTimePicker,
  showTimePicker,
  updateEntry,
}) => {
  const [startDay, setStartDay] = useState(new Date(entry.startTime));
  const [endDay, setEndDay] = useState(new Date(entry.endTime));
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTimePicker(false);
        updateEntry(false);
      }
    };

    if (showTimePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimePicker]);

  const startChange = (date) => {
    setStartDay(date);
    const newEntry = { ...entry, startTime: date.toISOString() };
    setDuration(getDuration(newEntry));
    setEntry(newEntry);
  };

  const endChange = (date) => {
    setEndDay(date);
    const newEntry = { ...entry, endTime: date.toISOString() };
    setDuration(getDuration(newEntry));
    setEntry(newEntry);
  };

  return (
    <div className="time-picker-wrapper" ref={dropdownRef}>
      <div className="time-picker-container">
        <p>Start</p>
        <DatePicker
          selected={startDay}
          onChange={startChange}
          showTimeInput
          timeInputLabel="Time"
          dateFormat="h:mm aa - dd MMM"
        />
      </div>
      <div className="time-picker-container">
        <p>Stop</p>
        <DatePicker
          selected={endDay}
          onChange={endChange}
          showTimeInput
          timeInputLabel="Time"
          dateFormat="h:mm aa - dd MMM"
        />
      </div>
    </div>
  );
};
export default TimePicker;
