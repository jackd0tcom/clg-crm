import PersonInput from "./PersonInput";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Confirm from "../UI/ConfirmModal";

const PersonView = ({
  data,
  refreshActivityData,
  refreshCaseData,
  isNewPerson,
  setIsNewPerson,
  caseId,
  type,
  objectTemplate,
  caseData,
  updateCase,
}) => {
  const [personId, setPersonId] = useState(data.personId);
  const isBillable = data.personId === caseData?.billableContact;
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (data?.personId) {
      setPersonId(data.personId);
    }
  }, [data?.personId]);

  const handleRemove = async () => {
    try {
      await axios
        .delete("/api/deletePerson", {
          data: { personId: personId, caseId },
        })
        .then((res) => {
          if (res.status === 200) {
            refreshActivityData();
            refreshCaseData();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const smallFields = ["state", "zip", "SSN"];

  let smallFieldsObject = {};

  if (type === "client") {
    smallFieldsObject.state = data.state;
    smallFieldsObject.zip = data.zip;
    smallFieldsObject.SSN = data.SSN;
    delete objectTemplate.state;
    delete objectTemplate.zip;
    delete objectTemplate.SSN;
  }

  const handleToggle = async () => {
    try {
      if (isBillable) {
        await updateCase("billableContact", null);
      } else await updateCase("billableContact", personId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="person-view-wrapper">
      <div className="person-view-fields">
        {Object.entries(objectTemplate).map(([fieldName]) => {
          if (type === "client") {
            if (fieldName === "smallFields") {
              return (
                <div className="small-fields">
                  {Object.entries(smallFieldsObject).map(([fieldName]) => (
                    <PersonInput
                      key={fieldName}
                      fieldName={fieldName}
                      value={data[fieldName] || ""}
                      personId={personId}
                      refreshActivityData={refreshActivityData}
                      refreshCaseData={refreshCaseData}
                      isNewPerson={isNewPerson}
                      caseId={caseId}
                      setPersonId={setPersonId}
                      setIsNewPerson={setIsNewPerson}
                      type={type}
                    />
                  ))}
                </div>
              );
            }
          }
          return (
            <PersonInput
              key={fieldName}
              fieldName={fieldName}
              value={data[fieldName] || ""}
              personId={personId}
              refreshActivityData={refreshActivityData}
              refreshCaseData={refreshCaseData}
              isNewPerson={isNewPerson}
              caseId={caseId}
              setPersonId={setPersonId}
              setIsNewPerson={setIsNewPerson}
              type={type}
            />
          );
        })}
        {type === "client" && (
          <div className="billed-client-switch">
            <h4>Billed Client</h4>
            <label className="switch">
              <input
                type="checkbox"
                onChange={() => handleToggle(!caseData.isBillable)}
                checked={isBillable}
                // disabled={isLoading}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}
        <div className="remove-person-button">
          {confirm ? (
            <div className="confirm-modal-overlay">
              <Confirm
                message={"delete this person?"}
                handleConfirm={handleRemove}
                setConfirm={setConfirm}
              />
            </div>
          ) : (
            <a
              onClick={() => {
                setConfirm(true);
              }}
            >
              Remove Person
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
export default PersonView;
