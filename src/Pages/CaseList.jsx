import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import CaseCard from "../Elements/CaseCard";
import CaseFilter from "../Elements/CaseFilter";
import CaseListSearch from "../Elements/CaseListSearch";

const CaseList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState();
  const [originalCases, setOriginalCases] = useState();
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getCasesWithTasks").then((res) => {
          setCases(res.data);
          setOriginalCases(res.data);
          setIsFetched(true);
        });
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, []);

  return !isFetched ? (
    <>Loading...</>
  ) : (
    <div className="case-list-wrapper">
      <div className="case-list-head">
        <h1>Cases</h1>
        <CaseListSearch
          cases={cases}
          setCases={setCases}
          originalCases={originalCases}
          setOriginalCases={setOriginalCases}
        />
        <CaseFilter
          cases={cases}
          setCases={setCases}
          originalCases={originalCases}
        />
        <a onClick={() => navigate("/case/0")}>New Case</a>
      </div>
      <div className="case-list">
        {cases.length > 0 ? (
          cases.map((data) => {
            return <CaseCard key={data.caseId} data={data} />;
          })
        ) : (
          <p>No Active Cases</p>
        )}
      </div>
    </div>
  );
};

export default CaseList;
