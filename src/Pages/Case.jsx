import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";
import ProfilePic from "../Elements/ProfilePic";
import ActivityLog from "../Elements/ActivityLog";
import TaskList from "../Elements/TaskList";
import { Link } from "react-router";
import Notes from "../Elements/Notes";
import PhaseToggle from "../Elements/PhaseToggle";
import PriorityToggle from "../Elements/PriorityToggle";
import AssigneeList from "../Elements/AssigneeList";
import PersonView from "../Elements/PersonView";
import CaseInput from "../Elements/CaseInput";
import PracticeAreaToggle from "../Elements/PracticeAreaToggle";

const Case = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState();
  const [activityData, setActivityData] = useState();
  const [phase, setPhase] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState();
  const [count, setCount] = useState(0);
  const [personView, setPersonView] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [title, setTitle] = useState();
  const [currentAreas, setCurrentAreas] = useState();
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newPracticeArea, setNewPracticeArea] = useState("");
  const [isNewCase, setIsNewCase] = useState(false);

  useEffect(() => {
    async function getData() {
      try {
        if (caseId == 0) {
          console.log("new case");
          setIsNewCase(true);
          setCaseData({
            caseId: null,
            title: "",
            notes: "",
            phase: "intake",
            priority: "normal",
            practiceAreas: [],
            people: [],
            assignees: [],
            tasks: [],
          });
          setPhase("intake");
          setPriority("normal");
          setNotes("");
          setTitle("Case Title");
          setCurrentAreas([]);
          setActivityData([]);
          return;
        } else {
          const caseResponse = await axios.get(`/api/getCase/${caseId}`);
          const activityResponse = await axios.get(
            `/api/getCaseActivities/${caseId}`
          );
          setCaseData(caseResponse.data);
          setActivityData(activityResponse.data);
          setPhase(caseResponse.data.phase);
          setPriority(caseResponse.data.priority);
          setNotes(caseResponse.data.notes);
          setTitle(caseResponse.data.title);
          setCurrentAreas(caseResponse.data.practiceAreas);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getData();
  }, [caseId]);

  const refreshActivityData = async () => {
    try {
      const activityResponse = await axios.get(
        `/api/getCaseActivities/${caseId}`
      );
      setActivityData(activityResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  const refreshCaseData = async () => {
    try {
      const caseResponse = await axios.get(`/api/getCase/${caseId}`);
      setCaseData(caseResponse.data);
      setPhase(caseResponse.data.phase);
      setPriority(caseResponse.data.priority);
      setNotes(caseResponse.data.notes);
      setCurrentAreas(caseResponse.data.practiceAreas);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdatePhase = (phase) => {
    try {
      axios.post("/api/updateCasePhase", { caseId, phase }).then((res) => {
        console.log(res);
        refreshActivityData();
      });
    } catch (error) {}
  };
  const handleUpdatePriority = (priority) => {
    try {
      axios
        .post("/api/updateCasePriority", { caseId, priority })
        .then((res) => {
          console.log(res);
          refreshActivityData();
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

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setPersonView(true);
  };
  const handleOnBlur = () => {
    setPersonView(false);
    setSelectedPerson("");
  };

  const newCase = async () => {
    try {
      const response = await axios.post("/api/newCase", {
        title: title || "Untitled Case",
      });

      // Use React Router navigate instead of window.history
      navigate(`/case/${response.data.caseId}`);
      
      // Update local state
      setCaseData(response.data);
      setIsNewCase(false);
      
      // Refresh data
      refreshCaseData();
      refreshActivityData();
    } catch (error) {
      console.log(error);
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
              {personView && selectedPerson && (
                <PersonView
                  onBlur={handleOnBlur}
                  refreshActivityData={refreshActivityData}
                  refreshCaseData={refreshCaseData}
                  data={selectedPerson}
                  caseId={caseId}
                  onClose={() => {
                    setPersonView(false);
                    setSelectedPerson(null);
                  }}
                />
              )}
              <h4>Practice Areas</h4>
              {isNewCase ? (
                <a
                  onClick={() => {
                    if (!caseData?.caseId) {
                      newCase().then(() => {
                        setIsAddingArea(true);
                      });
                    } else {
                      setIsAddingArea(true);
                    }
                  }}
                >
                  Add Practice Area
                </a>
              ) : (
                caseData.practiceAreas.map((area) => {
                  return (
                    <a
                      key={area.practiceAreaId}
                      onClick={() => {
                        setIsAddingArea(true);
                      }}
                    >
                      {capitalize(area.name)}
                    </a>
                  );
                })
              )}
              {isAddingArea && (
                <PracticeAreaToggle
                  currentAreas={currentAreas}
                  setCurrentAreas={setCurrentAreas}
                  newPracticeArea={newPracticeArea}
                  setNewPracticeArea={setNewPracticeArea}
                  caseId={caseId}
                  refreshCaseData={refreshCaseData}
                  refreshActivityData={refreshActivityData}
                  isAddingArea={isAddingArea}
                  setIsAddingArea={setIsAddingArea}
                />
              )}
              <CaseInput
                title={title}
                setTitle={setTitle}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                caseId={caseId}
              />
              {isNewCase ? (
                <a
                  onClick={() => {
                    if (!caseData?.caseId) {
                      newCase().then(() => {
                        // Handle adding client logic here
                        console.log("Case created, now add client");
                      });
                    } else {
                      // Handle adding client logic here
                      console.log("Add client to existing case");
                    }
                  }}
                >
                  Add Client
                </a>
              ) : (
                caseData.people.map((person, idx) => {
                  if (caseData.people.length === 1) {
                    return (
                      <a
                        key={person.personId}
                        className="case-person-link"
                        onClick={() => handlePersonClick(person)}
                      >{`${person.firstName} ${person.lastName}`}</a>
                    );
                  } else if (idx === caseData.people.length - 1) {
                    return (
                      <span key={person.personId}>
                        {" "}
                        &{" "}
                        <a
                          className="case-person-link"
                          onClick={() => handlePersonClick(person)}
                        >{`${person.firstName} ${person.lastName}`}</a>
                      </span>
                    );
                  } else if (idx === caseData.people.length - 2) {
                    return (
                      <a
                        key={person.personId}
                        className="case-person-link"
                        onClick={() => handlePersonClick(person)}
                      >{`${person.firstName} ${person.lastName}`}</a>
                    );
                  } else
                    return (
                      <a
                        key={person.personId}
                        className="case-person-link"
                        onClick={() => handlePersonClick(person)}
                      >{`${person.firstName} ${person.lastName}, `}</a>
                    );
                })
              )}
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
                <AssigneeList
                  assignees={caseData.assignees}
                  caseId={caseData.caseId}
                  onActivityUpdate={refreshActivityData}
                />
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
