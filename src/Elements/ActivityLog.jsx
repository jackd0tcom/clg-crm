import ActivityLogItem from "./ActivityLogItem";
import CommentItem from "./CommentItem";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import CommentInput from "./CommentInput";

const ActivityLog = ({ data, objectType, objectId, refreshActivityData }) => {
  const [showAll, setShowAll] = useState(true);
  const [shortList, setShortList] = useState();
  const user = useSelector((state) => state.user);
  const activityLogRef = useRef(null);

  useEffect(() => {
    if (data.length > 8) {
      setShowAll(false);
      setShortList(data.slice(data.length - 10, data.length));
    }
  }, [data]);

  // auto scroll to bottom
  useEffect(() => {
    if (activityLogRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        activityLogRef.current.scrollTop = activityLogRef.current.scrollHeight;
      });
    }
  }, [data]);

  return (
    <div className="activity-log-wrapper">
      <div className="activity-log-header">
        <h2 id="activity-heading">Activity</h2>
        {shortList && (
          <div
            onClick={() => {
              if (!showAll) {
                setShowAll(true);
              } else setShowAll(false);
            }}
            className="activity-show-wrapper"
          >
            {showAll ? (
              <i className="fa-solid fa-chevron-down"></i>
            ) : (
              <i className="fa-solid fa-chevron-up"></i>
            )}

            {shortList && <p>{!showAll ? "See All Activity" : "See Less"}</p>}
          </div>
        )}
      </div>
      <div className="activity-log-items" ref={activityLogRef}>
        {!shortList
          ? data.map((act) => {
              if (act.itemType === "comment") {
                return (
                  <CommentItem data={act} key={"comment" + act.commentId} />
                );
              } else
                return (
                  <ActivityLogItem
                    user={user}
                    key={"logitem" + act.activityId}
                    data={act}
                  />
                );
            })
          : showAll
          ? data.map((act) => {
              if (act.itemType === "comment") {
                return (
                  <CommentItem data={act} key={"comment" + act.commentId} />
                );
              } else
                return (
                  <ActivityLogItem
                    user={user}
                    key={"logitem" + act.activityId}
                    data={act}
                  />
                );
            })
          : shortList.map((act) => {
              if (act.itemType === "comment") {
                return (
                  <CommentItem data={act} key={"comment" + act.commentId} />
                );
              } else
                return (
                  <ActivityLogItem
                    user={user}
                    key={"logitem" + act.activityId}
                    data={act}
                  />
                );
            })}
      </div>
      <CommentInput
        objectType={objectType}
        objectId={objectId}
        refreshActivityData={refreshActivityData}
      />
    </div>
  );
};

export default ActivityLog;
