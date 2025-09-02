import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const DueDatePicker = ({
  currentDate,
  taskId,
  refreshTaskData,
  refreshTaskActivity,
}) => {
  const [dueDate, setDueDate] = useState(currentDate);

  const onDateChange = async (date) => {
    try {
      if (taskId) {
        await axios.post("/api/updateTask", {
          fieldName: "dueDate",
          value: date,
          taskId,
        });
      } else return;
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
    </div>
  );
};

export default DueDatePicker;
