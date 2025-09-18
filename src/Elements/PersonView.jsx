import PersonInput from "./PersonInput";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Confirm from "./ConfirmModal";

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
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setPersonId(data.personId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddingPerson(false);
        onBlur();
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
    SSN: "",
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
      {confirm && (
        <Confirm
          message={"delete this person?"}
          handleConfirm={handleRemove}
          setConfirm={setConfirm}
        />
      )}
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
              setConfirm(true);
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
