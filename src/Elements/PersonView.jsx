import PersonInput from "./PersonInput";
import { useState } from "react";

const PersonView = ({ data, onBlur, refreshActivityData, refreshCaseData }) => {
  return (
    <div className="person-view-wrapper">
      <a className="person-view-close" onClick={() => onBlur()}>
        x
      </a>
      <h3>Client</h3>
      <div className="person-view-fields">
        {Object.entries(data)
          .filter(
            ([fieldName]) =>
              !["personId", "caseId", "createdAt", "updatedAt"].includes(
                fieldName
              )
          )
          .map(([fieldName, value]) => {
            return (
              <PersonInput
                key={fieldName}
                fieldName={fieldName}
                value={value}
                personId={data.personId}
                refreshActivityData={refreshActivityData}
                refreshCaseData={refreshCaseData}
              />
            );
          })}
      </div>
    </div>
  );
};
export default PersonView;
