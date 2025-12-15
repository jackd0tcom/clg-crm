import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import ActivityLog from "../Elements/UI/ActivityLog";
import TaskList from "../Elements/TaskList/TaskList";
import Notes from "../Elements/UI/Notes";
import CaseInput from "../Elements/Case/CaseInput";
import ExtraSettings from "../Elements/UI/ExtraSettings";
import Loader from "../Elements/UI/Loader";
import DetailsTab from "../Elements/Case/DetailsTab";
import PeopleTab from "../Elements/Case/PeopleTab";

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
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [currentSOL, setCurrentSOl] = useState(null);
  const [currentTribunal, setCurrentTribunal] = useState();
  const [currentTab, setCurrentTab] = useState("details");
  const [clients, setClients] = useState([]);
  const [adverse, setAdverse] = useState([]);
  const [opposing, setOpposing] = useState([]);
  const [adverseOpposing, setAdverseOpposing] = useState([]);
  const dropdownRef = useRef(null);
  const isCreatingCaseRef = useRef(false);

  const headings = ["Status", "Title", "Priority", "Assignees", "Due Date"];

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
        setTitle("");
        setCurrentSOl(null);
        setCurrentAreas([]);
        setActivityData([]);
        setCurrentTribunal(null);
        setClients([]);
        setAdverseOpposing([]);
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
        setCurrentSOl(caseResponse.data.sol);
        setCurrentAreas(caseResponse.data.practiceAreas);
        setIsArchived(caseResponse.data.isArchived);
        setCurrentTribunal(caseResponse.data.tribunal);
        setClients(
          caseResponse.data.people.filter((person) => person.type === "client")
        );
        setAdverse(
          caseResponse.data.people.filter((person) => person.type === "adverse")
        );
        setOpposing(
          caseResponse.data.people.filter(
            (person) => person.type === "opposing"
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetches init data, timeout fixes page reload infinite loader rendering bug
  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 100);
  }, [caseId]);

  // Refetch case data when refreshKey changes (when tasks are updated)
  useEffect(() => {
    if (refreshKey > 0) {
      getData();
    }
  }, [refreshKey]);

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
      setClients(
        caseResponse.data.people.filter((person) => person.type === "client")
      );
      setAdverse(
        caseResponse.data.people.filter((person) => person.type === "adverse")
      );
      setOpposing(
        caseResponse.data.people.filter((person) => person.type === "opposing")
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdatePhase = (newPhase) => {
    if (newPhase !== phase) {
      try {
        axios
          .post("/api/updateCasePhase", { caseId, phase: newPhase })
          .then((res) => {
            setPhase(res.data.phase);
            refreshActivityData();
          });
      } catch (error) {}
    } else return;
  };

  const updateNotes = () => {
    try {
      axios.post("/api/updateCaseNotes", { caseId, notes }).then((res) => {
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

  const newCase = async () => {
    // Prevent duplicate case creation using ref (not affected by re-renders)
    if (isCreatingCaseRef.current) {
      console.log("Case creation already in progress, skipping...", {
        isCreatingCase: isCreatingCase,
        isCreatingCaseRef: isCreatingCaseRef.current,
      });
      return;
    }

    try {
      // console.log("Starting case creation...", { title, isCreatingCase });
      setIsCreatingCase(true);
      isCreatingCaseRef.current = true;

      const caseTitle =
        title && title.trim() !== "Untitled Case"
          ? title.trim()
          : "Untitled Case";

      // console.log("Creating case with title:", caseTitle);
      const response = await axios.post("/api/newCase", {
        title: caseTitle,
      });
      // console.log("Case created successfully:", response.data);

      // Navigate first, then update state
      navigate(`/case/${response.data.caseId}`);

      setCaseData(response.data);
      setIsNewCase(false);
      refreshCaseData();
      refreshActivityData();
    } catch (error) {
      console.log(error);
    } finally {
      // console.log("Case creation completed, resetting flags");
      setIsCreatingCase(false);
      isCreatingCaseRef.current = false;
    }
  };

  return !caseData ? (
    <Loader />
  ) : (
    <div className="case-container">
      <div className="case-wrapper">
        <div className="case-details-container">
          <div className="case-top-bar">
            <Link to="/cases">
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
              <CaseInput
                title={title}
                setTitle={setTitle}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                caseId={caseId}
                isNewCase={isNewCase}
                newCase={newCase}
                isCreatingCase={isCreatingCase}
              />
              <div className="case-tabs-wrapper">
                <h4
                  onClick={() => setCurrentTab("details")}
                  className={
                    currentTab === "details"
                      ? "case-tab-heading active-tab"
                      : "case-tab-heading"
                  }
                >
                  Details
                </h4>
                <h4
                  onClick={() => setCurrentTab("client")}
                  className={
                    currentTab === "client"
                      ? "case-tab-heading active-tab"
                      : "case-tab-heading"
                  }
                >
                  Client
                </h4>
                <h4
                  onClick={() => setCurrentTab("adverse")}
                  className={
                    currentTab === "adverse"
                      ? "case-tab-heading active-tab"
                      : "case-tab-heading"
                  }
                >
                  Adverse Party
                </h4>
                <h4
                  onClick={() => setCurrentTab("opposing")}
                  className={
                    currentTab === "opposing"
                      ? "case-tab-heading active-tab"
                      : "case-tab-heading"
                  }
                >
                  Opposing Council
                </h4>
              </div>
            </div>
            {currentTab === "details" && (
              <DetailsTab
                caseData={caseData}
                phase={phase}
                handleUpdatePhase={handleUpdatePhase}
                setPhase={setPhase}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                isNewCase={isNewCase}
                currentSOL={currentSOL}
                caseId={caseId}
                setCurrentSOL={setCurrentSOl}
                currentTribunal={currentTribunal}
                setCurrentTribunal={setCurrentTribunal}
                notes={notes}
                handleUpdateNotes={handleUpdateNotes}
                Notes={Notes}
                count={count}
                setCount={setCount}
                updateNotes={updateNotes}
                newCase={newCase}
                currentAreas={currentAreas}
                setCurrentAreas={setCurrentAreas}
                newPracticeArea={newPracticeArea}
                setNewPracticeArea={setNewPracticeArea}
                isAddingArea={isAddingArea}
                setIsAddingArea={setIsAddingArea}
              />
            )}
            {currentTab === "client" && (
              <PeopleTab
                people={clients}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                caseId={caseId}
                type={"client"}
              />
            )}
            {currentTab === "adverse" && (
              <PeopleTab
                people={adverse}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                caseId={caseId}
                type={"adverse"}
              />
            )}
            {currentTab === "opposing" && (
              <PeopleTab
                people={opposing}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
                caseId={caseId}
                type={"opposing"}
              />
            )}
          </div>
        </div>
        <div className="case-activity-container">
          <ActivityLog
            data={activityData}
            objectId={caseId}
            objectType={"case"}
            refreshActivityData={refreshActivityData}
          />
        </div>
      </div>
      <div className="case-task-container">
        <div className="case-view-task-wrapper">
          <div className="case-view-tasks-header">
            <h3>Tasks</h3>
            <p onClick={() => navigate(`/tasks/${caseId}`)}>
              See all tasks for this case
            </p>
          </div>
          <div className="case-view-task-list">
            <div className="head-wrapper">
              <div className="case-view-tasks-list-head tasks-list-head">
                {headings.map((heading) => {
                  if (heading === "Status") {
                    return <p key="status"></p>;
                  } else if (heading === "Priority") {
                    return (
                      <p className="priority-heading" key={heading}>
                        {heading}
                      </p>
                    );
                  } else return <p key={heading}>{heading}</p>;
                })}
              </div>
            </div>
            <TaskList
              caseId={caseData.caseId}
              tasks={caseData.tasks}
              headings={headings}
              columns="0.1fr 2.15fr 2.5fr 2.3fr 1.15fr"
              openTaskView={openTaskView}
              refreshCaseData={refreshCaseData}
              refreshActivityData={refreshActivityData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Case;
