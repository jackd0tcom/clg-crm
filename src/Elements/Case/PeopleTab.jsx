import { useState, useEffect, useMemo } from "react";
import PersonView from "./PersonView";
import { capitalize } from "../../helpers/helperFunctions";
import axios from "axios";
import PersonSelector from "./PersonSelector";

const PeopleTab = ({
  people,
  setPeople,
  refreshActivityData,
  refreshCaseData,
  caseId,
  type,
  peopleList,
}) => {
  const [currentTab, setCurrentTab] = useState(
    people.length > 0 ? people[0].personId : 0,
  );
  const [isNewPerson, setIsNewPerson] = useState(false);
  const [showAddPersonPage, setShowAddPersonPage] = useState(false);
  const [error, setError] = useState("");

  let emptyPageMessage =
    "To add a new client to this case, click the button below, or the + button above";
  let emptyPersonObject = {};
  const clientObject = {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    smallFields: null,
    zip: "",
    SSN: "",
    county: "",
    dob: "",
    phoneNumber: "",
    email: "",
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

  useEffect(() => {
    if (people && tabs.length === 0) {
      setShowAddPersonPage(true);
    }
  }, []);

  // Derive tabs from people + conditionally add dummy tab
  const tabs = useMemo(() => {
    if (isNewPerson) {
      return [...people, emptyPersonObject];
    }
    console.log("tabs");
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
      setShowAddPersonPage(false);
      setCurrentTab(tab.personId);
      setIsNewPerson(false);
    }
  };

  const handleAddPerson = () => {
    setShowAddPersonPage(false);
    setIsNewPerson(true);
    setCurrentTab("dummy");
  };

  const handleSelectExisting = async (personId) => {
    try {
      await axios
        .post("/api/assignPersonToCase", {
          personId,
          caseId,
          type,
        })
        .then((res) => {
          if (res.status === 200) {
            setPeople((prev) => [res.data, ...prev]);
            setShowAddPersonPage(false);
            setCurrentTab(personId);
          }
        });
    } catch (error) {
      console.log(error);
      if (error.status === 409) {
        setError(
          "Selected person is already on this case! Please select someone else.",
        );
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    }
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
        <h4
          onClick={() => setShowAddPersonPage(true)}
          className="client-tab-heading"
        >
          +
        </h4>
      </div>
      {showAddPersonPage ? (
        <div className="add-person-page">
          <i className="fa-solid fa-person"></i>
          <p>{emptyPageMessage}</p>
          {error !== "" && <div className="add-person-error">{error}</div>}
          <PersonSelector
            peopleList={peopleList}
            people={people}
            handleSelectExisting={handleSelectExisting}
          />
          <button className="add-person-page-button" onClick={handleAddPerson}>
            <i class="fa-solid fa-plus" id="add-person-icon"></i>
            Add New Person
          </button>
        </div>
      ) : (
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
