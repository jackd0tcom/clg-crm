import { capitalize } from "../helpers/helperFunctions";

const PriorityIcon = ({ data }) => {
  return (
    <div className="priority-icon-wrapper">
      <p className={`priority-icon ${data}-priority`}>
        {capitalize(data)} <i className="fa-solid fa-flag"></i>
      </p>
    </div>
  );
};
export default PriorityIcon;
