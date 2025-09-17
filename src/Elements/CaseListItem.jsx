import { capitalize } from "../helpers/helperFunctions";
import { useNavigate } from "react-router";
import { addRecentItem } from "../helpers/recentItemsHelper";

const CaseListItem = ({ data }) => {
  const navigate = useNavigate();

  const handleCaseClick = () => {
    // Add case to recent items before navigating
    addRecentItem(data, 'case');
    navigate(`/case/${data.caseId}`);
  };

  return (
    <a key={data.title} onClick={handleCaseClick}>
      <div className="case-list-item-wrapper">
        <p>{data.title}</p>
        <p>{capitalize(data.phase)}</p>
      </div>
    </a>
  );
};
export default CaseListItem;
