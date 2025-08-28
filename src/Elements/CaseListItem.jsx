import { capitalize } from "../helpers/helperFunctions";
import { useNavigate } from "react-router";

const CaseListItem = ({ data }) => {
  const navigate = useNavigate();

  return (
    <a key={data.title} onClick={() => navigate(`/case/${data.caseId}`)}>
      <div className="case-list-item-wrapper">
        <p>{data.title}</p>
        <p>{capitalize(data.phase)}</p>
      </div>
    </a>
  );
};
export default CaseListItem;
