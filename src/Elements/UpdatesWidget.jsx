import NotificationList from "./NotificationList";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const UpdatesWidget = () => {
  const [updates, setUpdates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/notifications").then((res) => {
          if (res.data) {
            const all = res.data.filter((item) => !item.isRead);
            setUpdates(all);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
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

  return (
    <div className="widget-container">
      <p onClick={() => navigate("/inbox")}>Updates</p>
      <NotificationList notifications={updates} handleRead={handleRead} />
    </div>
  );
};
export default UpdatesWidget;
