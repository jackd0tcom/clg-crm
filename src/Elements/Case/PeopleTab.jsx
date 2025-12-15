import { useState, useEffect, useMemo } from "react";
import PersonView from "./PersonView";
import { capitalize } from "../../helpers/helperFunctions";

const PeopleTab = ({
  people,
  refreshActivityData,
  refreshCaseData,
  caseId,
  type,
}) => {
  const [currentTab, setCurrentTab] = useState(
    people.length > 0 ? people[0].personId : 0
  );
  const [isNewPerson, setIsNewPerson] = useState(false);

  let emptyPageMessage =
    "To add a new client to this case, click the button below, or the + button above";
  let emptyPersonObject = {};
  const clientObject = {
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
  const adverseObject = {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phoneNumber: "",
    email: "",
    personId: "dummy",
    type: "adverse",
  };
  const opposingObject = {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phoneNumber: "",
    email: "",
    personId: "dummy",
    type: "adverse",
  };
  if (type === "client") {
    emptyPersonObject = clientObject;
  }
  if (type === "adverse") {
    emptyPersonObject = adverseObject;
    emptyPageMessage =
      "To add a new person to the adverse party, click the button below, or the + button above";
  }
  if (type === "opposing") {
    emptyPersonObject = opposingObject;
    emptyPageMessage =
      "To add a new person to the opposing party, click the button below, or the + button above";
  }
  const personViewObject = emptyPersonObject;
  delete personViewObject.personId;
  delete personViewObject.type;

  // Derive tabs from people + conditionally add dummy tab
  const tabs = useMemo(() => {
    if (isNewPerson) {
      return [...people, emptyPersonObject];
    }
    return people;
  }, [people, isNewPerson]);

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
      const currentExists = people.find((p) => p.personId === currentTab);
      if (!currentExists && people.length > 0) {
        setCurrentTab(people[people.length - 1].personId);
      } else if (!currentExists && people.length === 0) {
        setCurrentTab(0);
      }
    }
  }, [people.length, isNewPerson, currentTab, people]);

  useEffect(() => {
    if (currentTab === "dummy" && !isNewPerson) {
      setCurrentTab(people[people.length - 1].personId);
    }
  }, [people]);

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
              {displayName || "New Person"}
            </h4>
          );
        })}
        <h4 onClick={handleAddPerson} className="client-tab-heading">
          +
        </h4>
      </div>
      {people && tabs.length === 0 && (
        <div className="add-person-page">
          <i className="fa-solid fa-person"></i>
          <p>{emptyPageMessage}</p>
          <button className="add-person-page-button" onClick={handleAddPerson}>
            Add Person
          </button>
        </div>
      )}
      {people && tabs.length !== 0 && (
        <PersonView
          data={currentPerson}
          refreshActivityData={refreshActivityData}
          refreshCaseData={refreshCaseData}
          caseId={caseId}
          isNewPerson={isNewPerson}
          setIsNewPerson={setIsNewPerson}
          type={type}
          objectTemplate={personViewObject}
        />
      )}
    </div>
  );
};

export default PeopleTab;
