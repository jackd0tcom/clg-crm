import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { getDuration } from "../../helpers/helperFunctions";

const TimePicker = ({
  entry,
  setEntry,
  setDuration,
  setShowTimePicker,
  showTimePicker,
  updateEntry,
}) => {
  const [date, setDate] = useState(new Date(entry.startTime));
  const [day, setDay] = useState(new Date(date).getDate());
  const [month, setMonth] = useState(new Date(date).getMonth());
  const [year, setYear] = useState(new Date(date).getFullYear());
  const [startTime, setStartTime] = useState(new Date(entry.startTime));
  const [endDay, setEndDay] = useState(new Date(entry.endTime));
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTimePicker(false);
        if (entry.timeEntryId) {
          updateEntry(false);
        }
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
    const hour = new Date(date).getHours();
    const minute = new Date(date).getMinutes();
    const newStart = new Date(year, month, day, hour, minute);
    setStartTime(newStart);
    let newEntry = {};
    if (newStart > endDay) {
      setEndDay(newStart);
      newEntry = {
        ...entry,
        startTime: newStart.toISOString(),
        endTime: newStart.toISOString(),
      };
      setEndDay(newStart);
    } else newEntry = { ...entry, startTime: newStart.toISOString() };
    setDuration(getDuration(newEntry));
    setEntry(newEntry);
  };

  const endChange = (date) => {
    if (date <= startTime) {
      return;
    }
    const hour = date.getHours();
    const minute = date.getMinutes();
    const newEnd = new Date(year, month, day, hour, minute);
    setEndDay(newEnd);
    const newEntry = { ...entry, endTime: newEnd.toISOString() };
    setDuration(getDuration(newEntry));
    setEntry(newEntry);
  };

  const dateChange = (date) => {
    const day = new Date(date).getDate();
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();
    const startHour = new Date(startTime).getHours();
    const startMinute = new Date(startTime).getMinutes();
    const endHour = new Date(endDay).getHours();
    const endMinute = new Date(endDay).getMinutes();
    const newStart = new Date(year, month, day, startHour, startMinute);
    const newEnd = new Date(year, month, day, endHour, endMinute);
    setStartTime(newStart);
    setEndDay(newEnd);
    const newEntry = {
      ...entry,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    };
    setEntry(newEntry);
    setDate(new Date(date));
  };

  return (
    <div className="time-picker-wrapper" ref={dropdownRef}>
      <div className="time-picker-times">
        <div className="time-picker-container">
          <p>Start</p>
          <DatePicker
            selected={startTime}
            onChange={startChange}
            showTimeSelect
            showTimeCaption={false}
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
          />
        </div>
        <div className="time-picker-container">
          <p>Stop</p>
          <DatePicker
            selected={endDay}
            onChange={endChange}
            showTimeSelect
            showTimeCaption={false}
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
          />
        </div>
      </div>
      <div className="time-picker-date">
        <DatePicker selected={startTime} onChange={dateChange} inline />
      </div>
    </div>
  );
};
export default TimePicker;
