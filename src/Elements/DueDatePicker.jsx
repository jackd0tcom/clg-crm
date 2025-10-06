import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const DueDatePicker = ({
  currentDate,
  taskId,
  refreshTaskData,
  refreshTaskActivityData,
  onTaskUpdate,
}) => {
  const [dueDate, setDueDate] = useState(currentDate);
  const [hover, setHover] = useState(false);

  const onDateChange = async (date) => {
    try {
      if (taskId) {
        if (date !== currentDate) {
          await axios
            .post("/api/updateTask", {
              fieldName: "dueDate",
              value: date,
              taskId,
            })
            .then((res) => {
              if (refreshTaskActivityData) {
                refreshTaskActivityData();
              }
              if (onTaskUpdate) {
                onTaskUpdate();
              }
            });
        } else {
          // For new tasks, just update the local state
          setDueDate(date);
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="date-picker-wrapper"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <i className="fa-solid fa-calendar-days"></i>
      <DatePicker
        selected={dueDate}
        isClearable
        onChange={(date) => {
          console.log("changed");
          setDueDate(date);
          onDateChange(date);
        }}
      />
    </div>
  );
};

export default DueDatePicker;
