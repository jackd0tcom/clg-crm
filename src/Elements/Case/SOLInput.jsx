import DatePicker from "react-datepicker";
import { useState } from "react";
import axios from "axios";

const SOLInput = ({
  currentSOL,
  caseId,
  refreshActivityData,
  setCurrentSOL,
}) => {
  const [SOL, setSOL] = useState(currentSOL);

  const onDateChange = async (date) => {
    try {
      if (!caseId) {
        return;
      }
      if (currentSOL) {
        if (date) {
          const current = new Date(currentSOL);
          if (
            date.getFullYear() === current.getFullYear() &&
            date.getMonth() === current.getMonth() &&
            date.getDate() === current.getDate()
          ) {
            return;
          }
        }
      }
      await axios
        .post("/api/updateCase", {
          fieldName: "sol",
          value: date,
          caseId,
        })
        .then((res) => {
          console.log(res.data);
          setSOL(date);
          if (refreshActivityData) {
            refreshActivityData();
          }
          setCurrentSOL(date);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="sol-input-wrapper">
      <i className="fa-solid fa-calendar-days"></i>
      <DatePicker
        selected={SOL}
        isClearable
        onChange={(date) => {
          setSOL(date);
          onDateChange(date);
        }}
      />
    </div>
  );
};
export default SOLInput;
