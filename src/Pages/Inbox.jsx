import { useState, useEffect } from "react";
import axios from "axios";
import NotificationList from "../Elements/NotificationList";

const Inbox = ({ openTaskView, setCheckNotifications, checkNotifications }) => {
  const [notifications, setNotifications] = useState([]);
  const [clearedNotifications, setClearedNotifications] = useState();

  const [showCleared, setShowCleared] = useState(false);

  const fetch = async () => {
    try {
      await axios.get("/api/notifications").then((res) => {
        if (res.data) {
          const all = res.data.filter((item) => !item.isCleared);
          const read = res.data.filter((item) => item.isCleared);
          setClearedNotifications(read);
          setNotifications(all);
          setCheckNotifications((prev) => (prev += 1));
        }
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleRead = async (notification) => {
    try {
      await axios
        .post("/api/notifications/mark-read", {
          notificationId: notification.notificationId,
        })
        .then((res) => {
          if (res.status === 200) {
            fetch();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCleared = async (notification) => {
    try {
      await axios
        .post("/api/notifications/mark-clear", {
          notificationId: notification.notificationId,
        })
        .then((res) => {
          if (res.status === 200) {
            fetch();
            setCheckNotifications((prev) => (prev += 1));
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleClear = async (notification) => {
    try {
      await axios.post("/api/notifications/mark-all-read").then((res) => {
        if (res.status === 200) {
          fetch();
          setCheckNotifications(true);
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
      <div className="inbox-lists">
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
    </div>
  );
};
export default Inbox;
