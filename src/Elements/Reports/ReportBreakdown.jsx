import ReportTableItem from "./ReportTableItem";

const ReportBreakdown = ({ data, columns, type }) => {
  return (
    <div className="report-breakdown-wrapper">
      <div
        className="report-breakdown-head"
        style={{ gridTemplateColumns: columns }}
      >
        <p>Title</p>
        {type === "cases" ? (
          <>
            <p>Phase</p>
            <p>SOL</p>
            <p>Date Opened</p>
          </>
        ) : (
          <>
            <p>Status</p>
            <p>Priority</p>
            <p>Date Created</p>
          </>
        )}
      </div>
      <div className="report-breakdown-table">
        {data.map((item) => {
          return (
            <ReportTableItem
              data={item}
              key={
                type === "cases" ? `item-${item.caseId}` : `item-${item.taskId}`
              }
              type={type}
              columns={columns}
            />
          );
        })}
      </div>
    </div>
  );
};
export default ReportBreakdown;
