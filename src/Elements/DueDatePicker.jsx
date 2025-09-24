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

  const onDateChange = async (date) => {
    try {
      if (taskId) {
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="date-picker-wrapper">
      <DatePicker
        selected={dueDate}
        onChange={(date) => {
          setDueDate(date);
          onDateChange(date);
        }}
      />
      <i className="fa-solid fa-calendar-days"></i>
    </div>
  );
};

export default DueDatePicker;
