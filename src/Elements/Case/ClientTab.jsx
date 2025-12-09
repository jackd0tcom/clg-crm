import { useState, useEffect } from "react";
import PersonView from "./PersonView";

const ClientTab = ({
  caseData,
  refreshActivityData,
  refreshCaseData,
  caseId,
}) => {
  const [currentTab, setCurrentTab] = useState(
    caseData ? caseData.people[0].personId : 0
  );
  const [tabs, setTabs] = useState([...caseData.people]);
  const [currentPerson, setCurrentPerson] = useState(caseData.people[0]);
  const [isNewPerson, setIsNewPerson] = useState(false);

  // Sync tabs and currentPerson with updated caseData
  useEffect(() => {
    if (caseData?.people) {
      setTabs([...caseData.people]);

      // If we're viewing an existing person (not a new one), update currentPerson
      if (!isNewPerson && currentTab !== 0) {
        const updatedPerson = caseData.people.find(
          (p) => p.personId === currentTab
        );
        if (updatedPerson) {
          setCurrentPerson(updatedPerson);
        }
      }
    }
  }, [caseData?.people, currentTab, isNewPerson]);

  return (
    <div className="case-client-tab-wrapper">
      <div className="client-tabs-wrapper">
        {tabs.map((tab) => {
          return (
            <h4
              onClick={() => {
                const person = tabs.find((p) => p.personId === tab.personId);
                if (person) {
                  setCurrentTab(tab.personId);
                  setCurrentPerson(person);
                  setIsNewPerson(false);
                }
              }}
              key={`client-${tab.personId}`}
              className={
                currentTab === tab.personId
                  ? "client-tab-heading active-tab"
                  : "client-tab-heading"
              }
            >{`${tab.firstName} ${tab.lastName}`}</h4>
          );
        })}
        <h4
          onClick={() => {
            setIsNewPerson(true);
            setCurrentPerson({
              firstName: "",
              lastName: "",
              address: "",
              city: "",
              state: "",
              zip: "",
              phoneNumber: "",
              dob: "",
              county: "",
              SSN: "",
            });
          }}
          className="client-tab-heading"
        >
          +
        </h4>
      </div>
      {caseData && tabs <= 0 && (
        <div className="add-person-page">
          <button>Add Person</button>
        </div>
      )}
      <PersonView
        data={currentPerson}
        refreshActivityData={refreshActivityData}
        refreshCaseData={refreshCaseData}
        caseId={caseId}
        isNewPerson={isNewPerson}
      />
    </div>
  );
};
export default ClientTab;
