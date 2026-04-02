import PhaseToggle from "./PhaseToggle";
import AssigneeList from "../Assignee/AssigneeList";
import SOLInput from "./SOLInput";
import TribunalToggle from "./TribunalToggle";
import Notes from "../UI/Notes";
import PracticeAreaToggle from "./PracticeAreaToggle";
import { useState } from "react";
import { formatPracticeAreas } from "../../helpers/helperFunctions";

const DetailsTab = ({
  caseData,
  phase,
  handleUpdatePhase,
  setPhase,
  refreshActivityData,
  refreshCaseData,
  isNewCase,
  currentSOL,
  caseId,
  setCurrentSOL,
  currentTribunal,
  setCurrentTribunal,
  notes,
  handleUpdateNotes,
  Notes,
  count,
  setCount,
  updateNotes,
  newCase,
  currentAreas,
  setCurrentAreas,
  newPracticeArea,
  setNewPracticeArea,
  isAddingArea,
  setIsAddingArea,
}) => {
  return (
    <div className="case-details-tab-wrapper">
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
        <div className="case-stats-container">
          <h4>SOL</h4>
          <h4>Tribunal</h4>
        </div>
        <div className="case-stats-container">
          <SOLInput
            currentSOL={currentSOL}
            caseId={caseId}
            refreshActivityData={refreshActivityData}
            setCurrentSOL={setCurrentSOL}
          />
          <TribunalToggle
            currentTribunal={currentTribunal}
            setCurrentTribunal={setCurrentTribunal}
            caseId={caseId}
            refreshActivityData={refreshActivityData}
          />
        </div>
      </div>
      <div className="case-practice-areas">
        <h4>Practice Areas</h4>
        <div
          className="case-practice-areas-wrapper"
          onClick={() => {
            if (!caseData?.caseId && !isCreatingCaseRef.current) {
              console.log("Practice area: Creating new case...");
              newCase().then(() => {
                setIsAddingArea(true);
              });
            } else if (caseData?.caseId) {
              setIsAddingArea(true);
            }
          }}
        >
          {isNewCase || caseData.practiceAreas.length < 1 ? (
            <a className="case-practice-area no-area">Add Practice Area</a>
          ) : (
            formatPracticeAreas(caseData.practiceAreas)
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
  );
};
export default DetailsTab;
