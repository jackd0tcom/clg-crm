import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";

const TimePicker = ({ entry, setEntry, setShowTimePicker, showTimePicker }) => {
  const [startHour, setStartHour] = useState(
    new Date(entry.startTime).getHours(),
  );
  const [startMinute, setStartMinute] = useState(
    new Date(entry.startTime).getMinutes(),
  );
  const [endHour, setEndHour] = useState(new Date(entry.endTime).getHours());
  const [endMinute, setEndMinute] = useState(
    new Date(entry.endTime).getMinutes(),
  );
  const [entryDay, setEntryDay] = useState(new Date(entry.startTime));
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTimePicker(false);
      }
    };

    if (showTimePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimePicker]);

  const updateEntry = () => {
    const startTime = new Date(entryDay, startHour, startMinute);
    const endTime = new Date(entryDay, endHour, endMinute);
    console.log(entryDay, startHour, startMinute);
    // setEntry({ ...entry });
  };

  return (
    <div className="time-picker-wrapper" ref={dropdownRef}>
      <div className="time-picker-container">
        <div className="pickers-wrapper">
          <div className="hour-minute-picker-wrapper">
            <p>Start</p>
            <div className="hour-minute-picker-container">
              <input
                type="number"
                value={startHour}
                onChange={(e) => {
                  setStartHour(e.target.value);
                  updateEntry();
                }}
              />
              :
              <input
                type="number"
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
              />
            </div>
          </div>
          <div className="hour-minute-picker-wrapper">
            <p>Stop</p>
            <div className="hour-minute-picker-container">
              <input
                type="number"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
              />
              :
              <input
                type="number"
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DatePicker selected={entryDay} inline />
      </div>
    </div>
  );
};
export default TimePicker;
