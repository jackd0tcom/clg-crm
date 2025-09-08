import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useRef } from "react";
import axios from "axios";
import { capitalize } from "../helpers/helperFunctions";
import ProfilePic from "../Elements/ProfilePic";
import ActivityLog from "../Elements/ActivityLog";
import TaskList from "../Elements/TaskList";
import { Link } from "react-router";
import Notes from "../Elements/Notes";
import PhaseToggle from "../Elements/PhaseToggle";
import AssigneeList from "../Elements/AssigneeList";
import PersonView from "../Elements/PersonView";
import CaseInput from "../Elements/CaseInput";
import PracticeAreaToggle from "../Elements/PracticeAreaToggle";
import ExtraSettings from "../Elements/ExtraSettings";

const Case = ({ openTaskView, refreshKey }) => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState();
  const [activityData, setActivityData] = useState();
  const [phase, setPhase] = useState("");
  const [notes, setNotes] = useState();
  const [count, setCount] = useState(0);
  const [personView, setPersonView] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [title, setTitle] = useState();
  const [currentAreas, setCurrentAreas] = useState();
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newPracticeArea, setNewPracticeArea] = useState("");
  const [isNewCase, setIsNewCase] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isNewPerson, setIsNewPerson] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const dropdownRef = useRef(null);

  const headings = ["Title", "Status", "Due Date", "Assignees", "Priority"];

  const getData = async () => {
    try {
      if (caseId == 0) {
        setIsNewCase(true);
        setCaseData({
          caseId: null,
          title: "",
          notes: "",
          phase: "intake",
          practiceAreas: [],
          people: [],
          assignees: [],
          tasks: [],
        });

        setPhase("intake");
        setNotes("");
        setTitle("Untitled Case");
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
        setNotes(caseResponse.data.notes);
        setTitle(caseResponse.data.title);
        setCurrentAreas(caseResponse.data.practiceAreas);
        setIsArchived(caseResponse.data.isArchived);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [caseId]);

  // Refetch case data when refreshKey changes (when tasks are updated)
  useEffect(() => {
    if (refreshKey > 0) {
      getData();
    }
  }, [refreshKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddingArea(false);
        setIsAddingPerson(false);
      }
    };

    if (isAddingArea || isAddingPerson) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingArea, isAddingPerson]);

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
      setNotes(caseResponse.data.notes);
      setCurrentAreas(caseResponse.data.practiceAreas);
      setIsArchived(caseResponse.data.isArchived);
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
    setIsAddingPerson(false);
  };

  const newCase = async () => {
    try {
      const caseTitle =
        title && title.trim() !== "Untitled Case"
          ? title.trim()
          : "Untitled Case";

      const response = await axios.post("/api/newCase", {
        title: caseTitle,
      });
      navigate(`/case/${response.data.caseId}`);

      setCaseData(response.data);
      setIsNewCase(false);
      refreshCaseData();
      refreshActivityData();
    } catch (error) {
      console.log(error);
    }
  };

  return caseData ? (
    <div className="case-container">
      <div className="case-wrapper">
        <div className="case-details-container">
          <div className="case-top-bar">
            <Link to="/cases">
              {" "}
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <ExtraSettings
              Id={caseId}
              handleRefresh={refreshCaseData}
              refreshActivityData={refreshActivityData}
              isArchived={isArchived}
              setIsArchived={setIsArchived}
            />
          </div>
          <div className="case-card">
            <div className="case-header">
              {isArchived && <h3>Archived</h3>}
              <div
                className="case-practice-areas-wrapper"
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
                {isNewCase || caseData.practiceAreas.length < 1 ? (
                  <a className="case-practice-area">Add Practice Area</a>
                ) : (
                  caseData.practiceAreas.map((area) => {
                    return (
                      <a
                        className="case-practice-area"
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
              </div>
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
                isNewCase={isNewCase}
                newCase={newCase}
              />
              <div className="case-persons-wrapper">
                {personView && selectedPerson && (
                  <PersonView
                    onBlur={handleOnBlur}
                    refreshActivityData={refreshActivityData}
                    refreshCaseData={refreshCaseData}
                    data={selectedPerson}
                    caseId={caseId}
                    isNewPerson={false}
                    isAddingPerson={isAddingPerson}
                    setIsAddingPerson={setIsAddingPerson}
                    onClose={() => {
                      setPersonView(false);
                      setSelectedPerson(null);
                    }}
                  />
                )}
                {isAddingPerson && (
                  <PersonView
                    data={{
                      firstName: "",
                      lastName: "",
                      address: "",
                      city: "",
                      state: "",
                      zip: "",
                      phoneNumber: "",
                      dob: "",
                      county: "",
                    }}
                    ref={dropdownRef}
                    onBlur={handleOnBlur}
                    refreshActivityData={refreshActivityData}
                    refreshCaseData={refreshCaseData}
                    caseId={caseId}
                    isNewPerson={isNewPerson}
                    setIsNewPerson={setIsNewPerson}
                    isAddingPerson={isAddingPerson}
                    setIsAddingPerson={setIsAddingPerson}
                  />
                )}
                <div className="case-persons-names-wrapper">
                  {caseData.people.length > 0 &&
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
                          <span
                            className="case-person-amp"
                            key={person.personId}
                          >
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
                    })}
                  {caseData.people.length === 0 && (
                    <p className="add-person-p">Add Person</p>
                  )}
                </div>
                <i
                  className="fa-solid fa-circle-plus add-person-button"
                  onClick={() => {
                    setIsAddingPerson(true);
                    setIsNewPerson(true);
                  }}
                ></i>
              </div>
              <div className="case-stats-wrapper">
                <div className="case-stats-container">
                  <h4>Phase</h4>
                  <h4>Assignees</h4>
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
                    isNewCase={isNewCase}
                  />
                </div>
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
        </div>
        <div className="case-activity-container">
          <ActivityLog data={activityData} />
        </div>
      </div>
      <div className="case-task-container">
        <div className="case-view-task-wrapper">
          <h3>Tasks</h3>
          <div className="case-view-task-list">
            <div className="head-wrapper">
              <div className="case-view-tasks-list-head tasks-list-head">
                {headings.map((heading) => {
                  return <p key={heading}>{heading}</p>;
                })}
              </div>
            </div>
            <TaskList
              caseId={caseData.caseId}
              tasks={caseData.tasks}
              headings={headings}
              columns="2fr 1fr 1fr 1fr"
              openTaskView={openTaskView}
              refreshCaseData={refreshCaseData}
              refreshActivityData={refreshActivityData}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <>
      <p>loading...</p>
    </>
  );
};

export default Case;
