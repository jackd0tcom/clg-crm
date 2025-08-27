import PersonInput from "./PersonInput";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

const PersonView = ({
  data,
  onBlur,
  refreshActivityData,
  refreshCaseData,
  isNewPerson,
  setIsNewPerson,
  caseId,
  isAddingPerson,
  setIsAddingPerson,
}) => {
  const [personId, setPersonId] = useState();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setPersonId(data.personId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("test");
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddingPerson(false);
        onBlur(); // Also call onBlur to close the component
      }
    };

    // Always add the event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsAddingPerson, onBlur]);

  const personObject = {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phoneNumber: "",
    dob: "",
    county: "",
  };

  const handleRemove = async () => {
    try {
      await axios
        .delete("/api/deletePerson", {
          data: { personId: personId },
        })
        .then((res) => {
          if (res.status === 200) {
            refreshActivityData();
            refreshCaseData();
            onBlur();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="person-view-wrapper" ref={dropdownRef}>
      <p className="person-view-header">Client</p>
      <div className="person-view-fields">
        {Object.entries(personObject).map(([fieldName]) => {
          return (
            <PersonInput
              key={fieldName}
              fieldName={fieldName}
              value={data[fieldName]}
              personId={personId}
              refreshActivityData={refreshActivityData}
              refreshCaseData={refreshCaseData}
              isNewPerson={isNewPerson}
              caseId={caseId}
              setPersonId={setPersonId}
              setIsNewPerson={setIsNewPerson}
            />
          );
        })}
        <div className="remove-person-button">
          <a
            onClick={() => {
              handleRemove();
            }}
          >
            Remove Person
          </a>
        </div>
      </div>
    </div>
  );
};
export default PersonView;
