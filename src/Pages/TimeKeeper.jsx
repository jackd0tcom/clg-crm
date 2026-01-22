import { useEffect, useState } from "react";
import Loader from "../Elements/UI/Loader";
import TimeKeeperWidget from "../Elements/TimeKeeper/TimeKeeperWidget";
import TimeKeeperList from "../Elements/TimeKeeper/TimeKeeperList";

const TimeKeeper = () => {
  return (
    <div className="time-tracker-page-wrapper">
      <div className="case-list-head">
        <h1 className="section-heading">Time Keeper</h1>
        <TimeKeeperWidget />
      </div>
      <TimeKeeperList />
    </div>
  );
};
export default TimeKeeper;
