import { useState } from "react";
import FilterDateRangeSelector from "./FilterDateRangeSelector";

const TimeKeeperFilter = ({ filter, setFilter }) => {
  return (
    <div className="time-keeper-filter-wrapper">
      <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
    </div>
  );
};
export default TimeKeeperFilter;
