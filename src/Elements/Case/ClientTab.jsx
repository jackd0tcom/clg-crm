import { useState, useEffect, useMemo } from "react";
import PersonView from "./PersonView";

const ClientTab = ({
  clients,
  refreshActivityData,
  refreshCaseData,
  caseId,
}) => {
  const [currentTab, setCurrentTab] = useState(
    clients.length > 0 ? clients[0].personId : 0
  );
  const [isNewPerson, setIsNewPerson] = useState(false);

  // Empty person object template
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
    type: "client",
  };

  // Derive tabs from clients + conditionally add dummy tab
  const tabs = useMemo(() => {
    if (isNewPerson) {
      return [...clients, emptyPersonObject];
    }
    return clients;
  }, [clients, isNewPerson]);

  // Derive currentPerson from currentTab
  const currentPerson = useMemo(() => {
    if (currentTab === "dummy") {
      return emptyPersonObject;
    }
    return tabs.find((tab) => tab.personId === currentTab) || {};
  }, [tabs, currentTab]);

  // Handle deletion: if current tab was deleted, switch to last person
  useEffect(() => {
    if (!isNewPerson && currentTab !== 0 && currentTab !== "dummy") {
      const currentExists = clients.find((p) => p.personId === currentTab);
      if (!currentExists && clients.length > 0) {
        setCurrentTab(clients[clients.length - 1].personId);
      } else if (!currentExists && clients.length === 0) {
        setCurrentTab(0);
      }
    }
  }, [clients.length, isNewPerson, currentTab, clients]);

  useEffect(() => {
    if (currentTab === "dummy" && !isNewPerson) {
      setCurrentTab(clients[clients.length - 1].personId);
    }
  }, [clients]);

  const handleTabClick = (tab) => {
    if (tab.personId === "dummy") {
      setCurrentTab("dummy");
      setIsNewPerson(true);
    } else {
      setCurrentTab(tab.personId);
      setIsNewPerson(false);
    }
  };

  const handleAddPerson = () => {
    setIsNewPerson(true);
    setCurrentTab("dummy");
  };

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
              onClick={() => handleTabClick(tab)}
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
        <h4 onClick={handleAddPerson} className="client-tab-heading">
          +
        </h4>
      </div>
      {clients && tabs.length === 0 && (
        <div className="add-person-page">
          <button onClick={handleAddPerson}>Add Person</button>
        </div>
      )}
      <PersonView
        data={currentPerson}
        refreshActivityData={refreshActivityData}
        refreshCaseData={refreshCaseData}
        caseId={caseId}
        isNewPerson={isNewPerson}
        setIsNewPerson={setIsNewPerson}
        type={"client"}
      />
    </div>
  );
};

export default ClientTab;
