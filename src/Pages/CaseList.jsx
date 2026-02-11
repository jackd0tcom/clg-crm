import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import CaseCard from "../Elements/CaseList/CaseCard";
import CaseFilter from "../Elements/CaseList/CaseFilter";
import CaseListSearch from "../Elements/CaseList/CaseListSearch";
import Loader from "../Elements/UI/Loader";
import { useSelector } from "react-redux";

const CaseList = ({ openTaskView, refreshKey }) => {
  const navigate = useNavigate();
  const userStore = useSelector((state) => state.user);
  const [cases, setCases] = useState([]);
  const [originalCases, setOriginalCases] = useState();
  const [allCases, setAllCases] = useState();
  const [isFetched, setIsFetched] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedCases, setArchivedCases] = useState([]);
  const [nonArchivedCases, setNonArchivedCases] = useState([]);
  const [oldestFirst, setOldestFirst] = useState([]);

  const fetchCases = async () => {
    try {
      const res = await axios.get("/api/getCasesWithTasks");
      // Filter out archived cases before setting initial state
      const nonArchivedCases = res.data.filter((a) => !a.isArchived);
      const archivedCases = res.data.filter((a) => a.isArchived);
      // initial load should be last updated non archived cases assigned to user
      setCases(nonArchivedCases);
      // allCases for seeing cases that the user might not be assigned to.
      setAllCases(nonArchivedCases);
      // nonArchived cases === last updated cases that user is assigned to
      setNonArchivedCases(
        nonArchivedCases.filter((ca) =>
          ca.assignees?.some((nee) => nee.userId === userStore.userId),
        ),
      );
      // oldest first cases
      setOldestFirst(
        nonArchivedCases
          .filter((ca) =>
            ca.assignees?.some((nee) => nee.userId === userStore.userId),
          )
          .reverse(),
      );
      // archived cases
      setArchivedCases(archivedCases);
      //
      setOriginalCases(
        res.data.filter((ca) =>
          ca.assignees?.some((nee) => nee.userId === userStore.userId),
        ),
      ); // Keep original data for filtering
      setIsFetched(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userStore.userId) {
      fetchCases();
    }
  }, [userStore.userId]);

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
          setCases={setCases}
          originalCases={originalCases}
          showArchived={showArchived}
          allCases={allCases}
          archivedCases={archivedCases}
          nonArchivedCases={nonArchivedCases}
          oldestFirst={oldestFirst}
        />
        <CaseListSearch
          cases={allCases}
          setCases={setCases}
          originalCases={originalCases}
          setOriginalCases={setOriginalCases}
          allCases={allCases}
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
