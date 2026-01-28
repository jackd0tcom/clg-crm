import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePic from "../UI/ProfilePic";
import { getDuration, formatDateNoTime } from "../../helpers/helperFunctions";
import StatusIcon from "../Task/StatusIcon";
import TimeKeeperFilter from "./TimeKeeperFilter";

const TimeKeeperList = () => {
  const [entryList, setEntryList] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/time-entry/getUserEntries").then((res) => {
          if (!res.statusText === "OK") {
            console.log(res);
            return;
          }
          setEntryList(res.data);
          console.log(res.data);
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="time-keeper-list">
      <div className="time-keeper-list-head">
        <p></p>
        <p>Project</p>
        <p>Description</p>
        <p>Duration</p>
        <p>Date</p>
      </div>
      {entryList?.length > 0 &&
        entryList.map((entry) => {
          return (
            <div key={entry.timeEntryId} className="time-keeper-list-item">
              <ProfilePic />
              <div className="time-keeper-item-project">
                {entry.caseId ? (
                  <i className="fa-solid fa-briefcase"></i>
                ) : (
                  <StatusIcon
                    status={entry.status}
                    hasIcon={true}
                    hasTitle={false}
                    noBg={true}
                  />
                )}

                {entry.projectTitle}
              </div>
              <p>{entry.notes}</p>
              <p>{getDuration(entry)}</p>
              <p>{formatDateNoTime(entry.createdAt)}</p>
            </div>
          );
        })}
    </div>
  );
};
export default TimeKeeperList;
