import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import CaseCard from "../Elements/CaseCard";
import CaseFilter from "../Elements/CaseFilter";
import CaseListSearch from "../Elements/CaseListSearch";
import Loader from "../Elements/Loader";

const CaseList = ({ openTaskView, refreshKey }) => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [originalCases, setOriginalCases] = useState();
  const [isFetched, setIsFetched] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await axios.get("/api/getCasesWithTasks");
      // Filter out archived cases before setting initial state
      const nonArchivedCases = res.data.filter((a) => !a.isArchived);
      setCases(nonArchivedCases);
      setOriginalCases(res.data); // Keep original data for filtering
      setIsFetched(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchCases();
    }
  }, [refreshKey]);

  return !isFetched ? (
    <Loader />
  ) : (
    <div className="case-list-wrapper">
      <div className="case-list-head">
        <div className="case-list-head-heading-wrapper">
          <h1 className="section-heading">My Cases</h1>
          <div className="case-count-wrapper">
            <p className="case-count">{cases.length} Open Cases</p>
          </div>
        </div>
        <CaseFilter
          cases={cases}
          setCases={setCases}
          originalCases={originalCases}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
        />
        <CaseListSearch
          cases={cases}
          setCases={setCases}
          originalCases={originalCases}
          setOriginalCases={setOriginalCases}
          showArchived={showArchived}
        />
        <a
          className="button button-primary add-case-button"
          onClick={() => navigate("/case/0")}
        >
          Open Case
        </a>
      </div>
      <div className="case-list">
        {cases.length > 0 ? (
          cases.map((data) => {
            return (
              <CaseCard
                key={data.caseId}
                data={data}
                openTaskView={openTaskView}
              />
            );
          })
        ) : (
          <div className="no-active-cases">
            <i className="fa-regular fa-folder-open"></i>
            <div>
              <h2>No Open Cases</h2>
              <p>
                Open a new one, or toggle archived cases above to see archived
                cases
              </p>
            </div>
            <a
              className="button button-primary add-case-button"
              onClick={() => navigate("/case/0")}
            >
              Open Case
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;
