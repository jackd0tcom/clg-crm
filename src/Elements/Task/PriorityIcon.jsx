import { capitalize } from "../../helpers/helperFunctions";
import { useEffect } from "react";

const PriorityIcon = ({ data }) => {
  return (
    <div className="priority-icon-wrapper">
      <p className={`priority-icon ${data}-priority`}>
        <i className="fa-solid fa-flag"></i>
        {capitalize(data)}
      </p>
    </div>
  );
};
export default PriorityIcon;
