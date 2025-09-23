import { capitalize } from "../helpers/helperFunctions";
import { useNavigate } from "react-router";
import { addRecentItem } from "../helpers/recentItemsHelper";
import PhaseIcon from "./PhaseIcon";

const CaseListItem = ({ data }) => {
  const navigate = useNavigate();

  const handleCaseClick = () => {
    addRecentItem(data, "case");
    navigate(`/case/${data.caseId}`);
  };

  return (
    <a key={data.title} onClick={handleCaseClick} className="case-list-item">
      <div className="case-list-item-wrapper">
        <div className="case-list-title">
          <i className="fa-solid fa-briefcase"></i>
          <p>{data.title}</p>
        </div>
        <PhaseIcon phase={data.phase} />
      </div>
    </a>
  );
};
export default CaseListItem;
