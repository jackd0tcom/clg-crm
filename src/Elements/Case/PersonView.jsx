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
}) => {
  const [personId, setPersonId] = useState(data.personId);
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
          data: { personId: personId },
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

  return (
    <div className="person-view-wrapper">
      <div className="person-view-fields">
        {Object.entries(objectTemplate).map(([fieldName]) => {
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
