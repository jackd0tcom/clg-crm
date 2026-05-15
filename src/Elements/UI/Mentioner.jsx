import { useMemo } from "react";
import ProfilePic from "./ProfilePic";
import StatusIcon from "../Task/StatusIcon";

const Mentioner = ({
  filteredData,
  comment,
  mentionData,
  mentionIndex,
  query,
}) => {
  return (
    <div className="dropdown mentioner-wrapper">
      {query.length <= 0 ? (
        <p className="mentioner-list-item">
          Mention a teammate or link to a task or case
        </p>
      ) : (
        <div className="mentioner-list">
          {filteredData.length > 0 &&
            filteredData.map((item, index) => {
              if (item.firstName) {
                return (
                  <div
                    key={`user-${item.firstName}-${item.lastName}-${index}`}
                    className={
                      mentionIndex !== index
                        ? "mentioner-list-item"
                        : "mentioner-list-item current-mention"
                    }
                  >
                    <ProfilePic src={item.ProfilePic} />
                    {item.firstName} {item.lastName}
                  </div>
                );
              } else if (item.taskId) {
                return (
                  <div
                    key={`task-${item.taskId}`}
                    className={
                      mentionIndex !== index
                        ? "mentioner-list-item"
                        : "mentioner-list-item current-mention"
                    }
                  >
                    <StatusIcon
                      status={item.status}
                      hasIcon={true}
                      hasTitle={false}
                      noBg={true}
                    />
                    {item.title}
                  </div>
                );
              } else if (item.caseId) {
                return (
                  <div
                    key={`case-${item.caseId}`}
                    className={
                      mentionIndex !== index
                        ? "mentioner-list-item"
                        : "mentioner-list-item current-mention"
                    }
                  >
                    <i className="fa-solid fa-briefcase grey-case"></i>
                    {item.title}
                  </div>
                );
              }
              return null;
            })}
        </div>
      )}
    </div>
  );
};
export default Mentioner;
