import { useEffect, useState } from "react";
import axios from "axios";
import CaseCard from "../Elements/CaseCard";

const CaseList = () => {
  const [caseData, setCaseData] = useState();
  const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getCasesWithTasks").then((res) => {
          setCaseData(res.data);
          setIsFetched(true);
          console.log(res.data);
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
      <h1>Cases</h1>
      <div className="case-list">
        {caseData.length > 0 ? (
          caseData.map((data) => {
            return <CaseCard key={data.caseId} data={data} />;
          })
        ) : (
          <button
            onClick={() => {
              navigate("/new-story");
            }}
          >
            Open a new case
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseList;
