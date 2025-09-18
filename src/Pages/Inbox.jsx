import { useState, useEffect } from "react";
import axios from "axios";
import NotificationList from "../Elements/NotificationList";

const Inbox = ({ openTaskView }) => {
  const [notifications, setNotifications] = useState([]);
  const [clearedNotifications, setClearedNotifications] = useState();

  const [showCleared, setShowCleared] = useState(false);

  const fetch = async () => {
    try {
      await axios.get("/api/notifications").then((res) => {
        if (res.data) {
          const all = res.data.filter((item) => !item.isCleared);
          const read = res.data.filter((item) => item.isCleared);
          setNotifications(all);
          setClearedNotifications(read);
        }
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleRead = async (id) => {
    try {
      await axios
        .post("/api/notifications/mark-read", { notificationId: id })
        .then((res) => {
          if (res.status === 200) {
            fetch();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCleared = async (id) => {
    try {
      await axios
        .post("/api/notifications/mark-clear", { notificationId: id })
        .then((res) => {
          if (res.status === 200) {
            fetch();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleClear = async (id) => {
    try {
      await axios.post("/api/notifications/mark-all-read").then((res) => {
        if (res.status === 200) {
          fetch();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="inbox-wrapper">
      <div className="inbox-header">
        <h1 className="section-heading">Inbox</h1>
        <div className="notifications-filter">
          <button
            className={
              showCleared
                ? "notifications-filter-button"
                : "notifications-filter-button active-filter"
            }
            onClick={() => setShowCleared(false)}
          >
            New
          </button>
          <button
            className={
              !showCleared
                ? "notifications-filter-button"
                : "notifications-filter-button active-filter"
            }
            onClick={() => setShowCleared(true)}
          >
            Cleared
          </button>
        </div>
        <button className="clear-all-button" onClick={() => handleClear()}>
          Clear all
        </button>
      </div>
      {!showCleared ? (
        <NotificationList
          notifications={notifications}
          handleRead={handleRead}
          openTaskView={openTaskView}
          handleCleared={handleCleared}
        />
      ) : (
        <NotificationList
          notifications={clearedNotifications}
          handleRead={handleRead}
          openTaskView={openTaskView}
          handleCleared={handleCleared}
        />
      )}
    </div>
  );
};
export default Inbox;
