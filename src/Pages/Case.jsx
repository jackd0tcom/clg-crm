import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";
import ProfilePic from "../Elements/ProfilePic";
import ActivityLog from "../Elements/ActivityLog";
import TaskList from "../Elements/TaskList";
import { Link } from "react-router";
import Notes from "../Elements/Notes";
import PhaseToggle from "../Elements/PhaseToggle";
import PriorityToggle from "../Elements/PriorityToggle";

const Case = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState();
  const [activityData, setActivityData] = useState();
  const [phase, setPhase] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function getData() {
      try {
        const caseResponse = await axios.get(`/api/getCase/${caseId}`);
        const activityResponse = await axios.get(
          `/api/getCaseActivities/${caseId}`
        );
        setCaseData(caseResponse.data);
        setActivityData(activityResponse.data);
        setPhase(caseResponse.data.phase);
        setPriority(caseResponse.data.priority);
        setNotes(caseResponse.data.notes);
      } catch (error) {
        console.log(error);
      }
    }
    getData();
  }, []);

  const handleUpdatePhase = (phase) => {
    try {
      axios.post("/api/updateCasePhase", { caseId, phase }).then((res) => {
        console.log(res);
      });
    } catch (error) {}
  };
  const handleUpdatePriority = (priority) => {
    try {
      axios
        .post("/api/updateCasePriority", { caseId, priority })
        .then((res) => {
          console.log(res);
        });
    } catch (error) {}
  };

  const updateNotes = () => {
    try {
      axios.post("/api/updateCaseNotes", { caseId, notes }).then((res) => {
        console.log(res);
        setCount(0);
      });
    } catch (error) {}
  };
  const handleUpdateNotes = (notes) => {
    setNotes(notes);
    if (count >= 75) {
      updateNotes();
    }
  };

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
                <h4>Assignees</h4>
                <h4>Priority</h4>
              </div>
              <div className="case-stats-container">
                <PhaseToggle
                  value={phase}
                  onHandle={handleUpdatePhase}
                  setPhase={setPhase}
                />
                <div className="case-assignee-wrapper">
                  {caseData.assignees.map((nee) => {
                    return <ProfilePic key={nee.userId} user={nee} />;
                  })}
                </div>
                <PriorityToggle
                  value={priority}
                  onHandle={handleUpdatePriority}
                  setPriority={setPriority}
                />
              </div>
            </div>
            <div className="case-notes">
              <Notes
                value={notes}
                onChange={handleUpdateNotes}
                setNotes={Notes}
                count={count}
                setCount={setCount}
                updateNotes={updateNotes}
              />
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
