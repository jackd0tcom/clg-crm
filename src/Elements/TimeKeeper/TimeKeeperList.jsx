import { useState, useEffect } from "react";
import axios from "axios";

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

  return <div className="time-keeper-list"></div>;
};
export default TimeKeeperList;
