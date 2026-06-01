import ActivityLogItem from "./ActivityLogItem";
import CommentItem from "../Comment/CommentItem";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import CommentInput from "../Comment/CommentInput";
import axios from "axios";
import Loader from "./Loader";

const ActivityLog = ({
  data,
  objectType,
  objectId,
  refreshActivityData,
  openTaskView,
}) => {
  const [showAll, setShowAll] = useState(true);
  const [shortList, setShortList] = useState();
  const [mentionData, setMentionData] = useState({});
  const user = useSelector((state) => state.user);
  const activityLogRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // auto scroll to bottom
  useEffect(() => {
    if (isLoading || !activityLogRef.current || !data?.length) return;
  
    requestAnimationFrame(() => {
      const el = activityLogRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [data, isLoading]);

  const fetchMentionData = async () => {
    try {
      await axios.get("/api/getMentionData").then((res) => {
        setMentionData(res.data);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMentionData();
  }, []);

  useEffect(() => {
    if (data.length > 10) {
      setShowAll(false);
      setShortList(data.slice(data.length - 10, data.length));
    }
  }, [data]);

  return (
    <div className="activity-log-wrapper">
      {isLoading ? (
        <Loader />
      ) : (
        <>
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

                {shortList && (
                  <p>{!showAll ? "See All Activity" : "See Less"}</p>
                )}
              </div>
            )}
          </div>
          <div className="activity-log-items" ref={activityLogRef}>
            {!shortList
              ? data.map((act) => {
                  if (act.itemType === "comment") {
                    return (
                      <CommentItem
                        data={act}
                        key={"comment" + act.commentId}
                        openTaskView={openTaskView}
                      />
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
                        <CommentItem
                          data={act}
                          key={"comment" + act.commentId}
                          openTaskView={openTaskView}
                        />
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
                        <CommentItem
                          data={act}
                          key={"comment" + act.commentId}
                          openTaskView={openTaskView}
                        />
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
            mentionData={mentionData}
            objectType={objectType}
            objectId={objectId}
            refreshActivityData={refreshActivityData}
            openTaskView={openTaskView}
          />
        </>
      )}
    </div>
  );
};

export default ActivityLog;
