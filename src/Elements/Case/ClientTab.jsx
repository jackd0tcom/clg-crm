import { useState, useEffect } from "react";
import PersonView from "./PersonView";

const ClientTab = ({
  caseData,
  refreshActivityData,
  refreshCaseData,
  caseId,
}) => {
  const [currentTab, setCurrentTab] = useState(
    caseData.people.length > 0 ? caseData.people[0].personId : 0
  );
  const [tabs, setTabs] = useState([...caseData.people]);
  const [currentPerson, setCurrentPerson] = useState(
    caseData.people.length > 0 ? caseData.people[0] : {}
  );
  const [isNewPerson, setIsNewPerson] = useState(false);

  // Sync tabs and currentPerson with updated caseData
  useEffect(() => {
    if (caseData?.people.length > 0) {
      const hasDummyTab = tabs.some((tab) => tab.personId === "dummy");

      // Syncs dummy tab data with newly created person
      if (hasDummyTab && !isNewPerson) {
        const newPerson = caseData.people[caseData.people.length - 1];
        setTabs(caseData.people);
        setCurrentTab(newPerson.personId);
        setCurrentPerson(newPerson);
      } else {
        // Preserve dummy tab if it exists, otherwise sync normally
        const dummyTab = tabs.find((tab) => tab.personId === "dummy");
        if (dummyTab) {
          // Keep the dummy tab and add it to the synced tabs
          setTabs([...caseData.people, dummyTab]);
        } else {
          setTabs([...caseData.people]);
        }

        // If we're viewing an existing person (not a new one), update currentPerson
        if (!isNewPerson && currentTab !== 0 && currentTab !== "dummy") {
          const updatedPerson = caseData.people.find(
            (p) => p.personId === currentTab
          );
          if (updatedPerson) {
            setCurrentPerson(updatedPerson);
          }
        }
      }
    }
  }, [caseData?.people, currentTab, isNewPerson]);

  return (
    <div className="case-client-tab-wrapper">
      <div className="client-tabs-wrapper">
        {tabs.map((tab) => {
          const displayName =
            tab.personId === "dummy"
              ? tab.firstName
                ? `${tab.firstName} ${tab.lastName || ""}`.trim()
                : "New Person"
              : `${tab.firstName || ""} ${tab.lastName || ""}`.trim();

          return (
            <h4
              onClick={() => {
                if (tab.personId === "dummy") {
                  // It's a dummy tab
                  setCurrentTab("dummy");
                  setCurrentPerson(tab);
                  setIsNewPerson(true);
                } else {
                  // Real person tab
                  setCurrentTab(tab.personId);
                  setCurrentPerson(tab);
                  setIsNewPerson(false);
                }
              }}
              key={`client-${tab.personId}`}
              className={
                currentTab === tab.personId
                  ? "client-tab-heading active-tab"
                  : "client-tab-heading"
              }
            >
              {displayName || "Unnamed"}
            </h4>
          );
        })}
        <h4
          onClick={() => {
            const emptyPersonObject = {
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
              personId: "dummy",
            };
            setIsNewPerson(true);
            setTabs((prevTabs) => [...prevTabs, emptyPersonObject]);
            setCurrentTab("dummy");
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
          <button
            onClick={() => {
              const emptyPersonObject = {
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
              };
              setIsNewPerson(true);
              setTabs((prevTabs) => [...prevTabs, emptyPersonObject]);
              setCurrentTab(tabs[tabs.length]);
              setCurrentPerson(emptyPersonObject);
            }}
          >
            Add Person
          </button>
        </div>
      )}
      <PersonView
        data={currentPerson}
        refreshActivityData={refreshActivityData}
        refreshCaseData={refreshCaseData}
        caseId={caseId}
        isNewPerson={isNewPerson}
        setIsNewPerson={setIsNewPerson}
      />
    </div>
  );
};
export default ClientTab;
