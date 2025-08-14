import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";
import ProfilePic from "../Elements/ProfilePic";
import ActivityLog from "../Elements/ActivityLog";
import TaskList from "../Elements/TaskList";
import { Link } from "react-router";

const Case = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState();
  const [activityData, setActivityData] = useState();

  useEffect(() => {
    async function getData() {
      try {
        const caseResponse = await axios.get(`/api/getCase/${caseId}`);
        const activityResponse = await axios.get(
          `/api/getCaseActivities/${caseId}`
        );
        setCaseData(caseResponse.data);
        setActivityData(activityResponse.data);
        console.log(caseResponse.data, activityResponse.data);
      } catch (error) {
        console.log(error);
      }
    }
    getData();
  }, []);

  return caseData ? (
    <>
      <div className="case-wrapper">
        <div className="case-details-container">
          <Link to="/cases">
            {" "}
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div className="case-card">
            <div className="case-header">
              <span>
                <p>{capitalize(caseData.practiceArea)}</p>
                <h2>{caseData.title}</h2>
                <h3>{caseData.clientName}</h3>
              </span>
            </div>
            <div className="case-stats-wrapper">
              <div className="case-stats-container">
                <h4>Phase</h4>
                <h4>Status</h4>
                <h4>Assignees</h4>
                <h4>Priority</h4>
              </div>
              <div className="case-stats-container">
                <h4>{capitalize(caseData.phase)}</h4>
                <h4>{capitalize(caseData.status)}</h4>
                <div className="case-assignee-wrapper">
                  {caseData.assignees.map((nee) => {
                    return <ProfilePic key={nee.userId} user={nee} />;
                  })}
                </div>
                <h4>{capitalize(caseData.priority)}</h4>
              </div>
            </div>
            <div className="case-notes">
              <h3>Notes</h3>
              <textarea name="" id="" value={caseData.notes}></textarea>
            </div>
          </div>
          <div className="case-view-task-wrapper">
            <h3>Tasks</h3>
            <div className="case-view-task-list">
              <TaskList data={caseData.tasks} />
            </div>
          </div>
        </div>
        <div className="case-activity-container">
          <ActivityLog data={activityData} />
        </div>
      </div>
    </>
  ) : (
    <>
      <p>loading...</p>
    </>
  );
};

export default Case;
