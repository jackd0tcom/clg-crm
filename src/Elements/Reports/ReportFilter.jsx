const ReportFilter = ({ filter, setFilter }) => {
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
    </div>
  );
};
export default ReportFilter;
