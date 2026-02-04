import { useState } from "react";
import FilterDateRangeSelector from "./FilterDateRangeSelector";
import FilterProjectPicker from "./FilterProjectPicker";
import TimeKeeperSorter from "./TimeKeeperSorter";

const TimeKeeperFilter = ({ filter, setFilter }) => {
  return (
    <div className="time-keeper-filter-wrapper">
      <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
      <FilterProjectPicker filter={filter} setFilter={setFilter} />
      {/* <TimeKeeperSorter filter={filter} setFilter={setFilter} /> */}
    </div>
  );
};
export default TimeKeeperFilter;
