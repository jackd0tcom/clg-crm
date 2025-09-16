import { useState, useEffect } from "react";
import axios from "axios";

const Inbox = () => {
  const [notifications, setNotifications] = useState();

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/getNotifications").then((res) => {
          setNotifications(res.data);
          console.log(res.data);
        });
      } catch (error) {}
    };
    fetch();
  }, []);

  return (
    <div className="inbox-wrapper">
      <div className="inbox-header">
        <h1 className="section-heading">Inbox</h1>
      </div>
    </div>
  );
};
export default Inbox;
