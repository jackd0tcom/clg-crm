import { capitalize } from "../../helpers/helperFunctions";

const TimeEntryStatusBadge = ({ status }) => {
  return status === "draft" ? (
    <p></p>
  ) : (
    <div className={`time-keeper-status ${status}-badge`}>
      {capitalize(status)}
    </div>
  );
};
export default TimeEntryStatusBadge;
