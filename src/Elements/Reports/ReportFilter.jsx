import DateRangePicker from "./DateRangePicker";
import { useState } from "react";

const ReportFilter = ({ filter, setFilter }) => {
  const [dateValue, setDateValue] = useState("");
  const [isChangingDate, setIsChangingDate] = useState(true);
  const now = new Date();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const firstOfThisYear = new Date(currentYear, 0, 1);
  const lastOfThisYear = new Date(currentYear, 11, 31);
  const firstOfThisMonth = new Date(currentYear, currentMonth, 1);
  const lastOfThisMonth = new Date(currentYear, currentMonth + 1, 0);

  return (
    <div className="report-filter-wrapper">
      <div className="report-filter-type-select">
        <p
          onClick={() => setFilter({ ...filter, type: "cases" })}
          className={filter.type === "cases" && "active-type"}
        >
          Cases
        </p>
        <p
          onClick={() => setFilter({ ...filter, type: "tasks" })}
          className={filter.type === "tasks" && "active-type"}
        >
          Tasks
        </p>
      </div>
      {isChangingDate && (
        <DateRangePicker
          dateValue={dateValue}
          setDateValue={setDateValue}
          filter={filter}
          setFilter={setFilter}
        />
      )}
    </div>
  );
};
export default ReportFilter;
