import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import CaseListItem from "./CaseListItem";
import Loader from "./Loader";

const CasesWidget = ({ loading, setLoading }) => {
  const [cases, setCases] = useState();
  const { isLoading, isAuthenticated } = useAuth0();

  useEffect(() => {
    async function fetch() {
      try {
        await axios.get("/api/getCases").then((res) => {
          setCases(res.data);
          setLoading(false);
        });
      } catch (error) {
        console.log(error);
      }
    }
    !isLoading &&
      isAuthenticated &&
      setTimeout(() => {
        fetch();
      }, 500);
  }, []);

  return (
    <div className="widget-container">
      <a
        onClick={() => navigate("/cases")}
        className="widget-container-heading"
      >
        My Cases
      </a>
      <div className="case-widget-container">
        {loading ? (
          <p>fetching cases...</p>
        ) : cases.length > 0 ? (
          cases.map((data) => {
            return <CaseListItem key={data.caseId} data={data} />;
          })
        ) : (
          <p>You are not assigned to any cases</p>
        )}
      </div>
    </div>
  );
};

export default CasesWidget;
