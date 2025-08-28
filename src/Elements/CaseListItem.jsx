import { capitalize } from "../helpers/helperFunctions";
import { useNavigate } from "react-router";

const CaseListItem = ({ data }) => {
  const navigate = useNavigate();

  return (
    <a onClick={() => navigate(`/case/${data.caseId}`)}>
      <div key={data.caseId} className="case-list-item-wrapper">
        <p>{data.title}</p>
        <p>{capitalize(data.phase)}</p>
      </div>
    </a>
  );
};
export default CaseListItem;
