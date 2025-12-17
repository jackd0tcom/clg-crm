import { Link } from "react-router-dom";
import PhaseIcon from "../Case/PhaseIcon";
import { formatDateNoTime } from "../../helpers/helperFunctions";
import PriorityIcon from "../Task/PriorityIcon";
import StatusIcon from "../Task/StatusIcon";

const ReportTableItem = ({ data, type, columns }) => {
  return (
    <Link to={type === "cases" ? `/case/${data.caseId}` : "/tasks"}>
      <div
        className="report-table-item"
        style={{ gridTemplateColumns: columns }}
      >
        <p>{data.title}</p>
        {type === "cases" ? (
          <>
            {<PhaseIcon phase={data.phase} />}
            <p>{data.sol || ""}</p>
            <p>{formatDateNoTime(data.createdAt)}</p>
          </>
        ) : (
          <>
            {
              <StatusIcon
                status={data.status}
                hasIcon={true}
                noBg={true}
                hasTitle={true}
              />
            }

            {<PriorityIcon data={data.priority} />}
            <p>{formatDateNoTime(data.createdAt)}</p>
          </>
        )}
      </div>
    </Link>
  );
};
export default ReportTableItem;
