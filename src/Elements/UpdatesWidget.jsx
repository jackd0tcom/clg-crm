import NotificationList from "./NotificationList";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const UpdatesWidget = ({ openTaskView }) => {
  const [updates, setUpdates] = useState([]);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      await axios.get("/api/notifications").then((res) => {
        if (res.data) {
          const all = res.data.filter((item) => !item.isCleared);
          setUpdates(all);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleCleared = async (notification) => {
    try {
      await axios
        .post("/api/notifications/mark-clear", {
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

  const handleRead = async (notification) => {
    if (!notification.isRead) {
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
    } else return;
  };

  return (
    <div className="widget-container">
      <p onClick={() => navigate("/inbox")}>Updates</p>
      <NotificationList
        notifications={updates}
        handleRead={handleRead}
        handleCleared={handleCleared}
        openTaskView={openTaskView}
      />
    </div>
  );
};
export default UpdatesWidget;
