import PersonInput from "./PersonInput";
import axios from "axios";
import { useState, useEffect } from "react";

const PersonView = ({
  data,
  onBlur,
  refreshActivityData,
  refreshCaseData,
  isNewPerson,
  setIsNewPerson,
  caseId,
}) => {
  const [personId, setPersonId] = useState();

  useEffect(() => {
    setPersonId(data.personId);
  }, []);

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
          data: { personId: personId } 
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
    <div className="person-view-wrapper">
      <a className="person-view-close" onClick={() => onBlur()}>
        x
      </a>
      <h3>Client</h3>
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
        <a
          onClick={() => {
            handleRemove();
          }}
        >
          Remove from case
        </a>
      </div>
    </div>
  );
};
export default PersonView;
