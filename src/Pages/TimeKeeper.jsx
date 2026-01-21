import { useEffect, useState } from "react";
import Loader from "../Elements/UI/Loader";
import TimeKeeperWidget from "../Elements/TimeKeeper/TimeKeeperWidget";

const TimeKeeper = () => {
  return (
    <div className="time-tracker-page-wrapper">
      <div className="case-list-head">
        <h1 className="section-heading">Time Keeper</h1>
        <TimeKeeperWidget />
      </div>
    </div>
  );
};
export default TimeKeeper;
