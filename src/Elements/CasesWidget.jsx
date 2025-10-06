import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import CaseListItem from "./CaseListItem";
import { useNavigate } from "react-router";

const CasesWidget = ({ loading, setLoading, userSynced }) => {
  const [cases, setCases] = useState();
  const { isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch cases if user is synced
    if (!userSynced) return;

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
      }, 100);
  }, [userSynced]);

  return (
    <div className="widget-container">
      <div className="widget-header">
        <p
          onClick={() => navigate("/cases")}
          className="widget-container-heading"
        >
          My Cases
        </p>
        <a
          className="button button-primary add-case-button-home"
          onClick={() => navigate("/case/0")}
        >
          <i class="fa-solid fa-plus"></i>
        </a>
      </div>
      <div className="case-widget-container">
        {loading ? (
          <div className="case-widget-loader">
            <p>Fetching your cases...</p>
          </div>
        ) : cases.length > 0 ? (
          cases.map((data) => {
            return <CaseListItem key={data.caseId} data={data} />;
          })
        ) : (
          <div className="no-active-cases-home">
            <i className="fa-regular fa-folder-open"></i>
            <div>
              <p>No Open Cases</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesWidget;
