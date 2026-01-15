import { useState, useMemo } from "react";
import DateRangePicker from "./DateRangePicker";
import ReportPracticeAreaToggle from "./ReportPracticeAreaToggle";

const ReportFilter = ({ filter, setFilter }) => {
  // Formats date to work with cally - removes time and adds a slash
  const formatCallyDate = (selectedDate) => {
    return filter.dateRange.start
      ? `${filter.dateRange.start.slice(0, 10)}/${filter.dateRange.end.slice(
          0,
          10
        )}`
      : selectedDate;
  };
  const [dateValue, setDateValue] = useState(formatCallyDate());
  const [quickRange, setQuickRange] = useState("This Month");
  const [isChangingDate, setIsChangingDate] = useState(false);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const firstMonthOfQuarter = Math.floor(month / 3) * 3;
  const currentQuarter = Math.floor(month / 3);
  const firstDayOfNextQuarter = new Date(year, (currentQuarter + 1) * 3, 1);
  const lastDayOfCurrentQuarter = new Date(
    firstDayOfNextQuarter.getTime() - 24 * 60 * 60 * 1000
  );

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Calculates Quick range values and sets the range in filter accordingly
  useMemo(() => {
    if (!filter && !quickRange) {
      return;
    }
    if (quickRange === "This Year") {
      setFilter({
        ...filter,
        dateRange: {
          start: `${new Date(year, 0, 1).toISOString()}`,
          end: `${new Date(year, 12, 0)}`,
        },
      });
      setDateValue(formatCallyDate());
    }
    if (quickRange === "This Month") {
      setFilter({
        ...filter,
        dateRange: {
          start: `${new Date(year, month, 1).toISOString()}`,
          end: `${new Date(year, month, 0)}`,
        },
      });
      setDateValue(formatCallyDate());
    }
    if (quickRange === "This Quarter") {
      setFilter({
        ...filter,
        dateRange: {
          start: `${new Date(year, firstMonthOfQuarter, 1).toISOString()}`,
          end: `${lastDayOfCurrentQuarter}`,
        },
      });
      setDateValue(formatCallyDate());
    }
  }, [quickRange]);

  return (
    <div className="report-filter-wrapper">
      <div className="report-filter-type-select">
        <p
          onClick={() => setFilter({ ...filter, type: "cases" })}
          className={filter.type === "cases" ? "active-type" : undefined}
        >
          Cases
        </p>
        <p
          onClick={() => setFilter({ ...filter, type: "tasks" })}
          className={filter.type === "tasks" ? "active-type" : undefined}
        >
          Tasks
        </p>
      </div>
      {filter.type === "cases" && (
        <div className="report-filter-type-select">
          <p
            onClick={() => setFilter({ ...filter, open: true })}
            className={filter.open ? "active-type" : undefined}
          >
            Open
          </p>
          <p
            onClick={() => setFilter({ ...filter, open: false })}
            className={!filter.open ? "active-type" : undefined}
          >
            Closed
          </p>
        </div>
      )}
      <div className="report-filter-date-wrapper">
        <p
          className="filter-date-button"
          onClick={() =>
            !isChangingDate ? setIsChangingDate(true) : setIsChangingDate(false)
          }
        >
          {quickRange}
        </p>
        {isChangingDate && (
          <DateRangePicker
            dateValue={dateValue}
            setDateValue={setDateValue}
            filter={filter}
            setFilter={setFilter}
            formatCallyDate={formatCallyDate}
            isChangingDate={isChangingDate}
            setIsChangingDate={setIsChangingDate}
            quickRange={quickRange}
            setQuickRange={setQuickRange}
          />
        )}
      </div>
      <ReportPracticeAreaToggle filter={filter} setFilter={setFilter} />
    </div>
  );
};
export default ReportFilter;
