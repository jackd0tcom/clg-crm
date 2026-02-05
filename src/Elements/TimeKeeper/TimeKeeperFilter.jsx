import { useState } from "react";
import FilterDateRangeSelector from "./FilterDateRangeSelector";
import FilterProjectPicker from "./FilterProjectPicker";
import TimeKeeperSorter from "./TimeKeeperSorter";
import TimeKeeperStats from "./TimeKeeperStats";

const TimeKeeperFilter = ({
  filter,
  setFilter,
  entries,
  showEntryView,
  setShowEntryView,
}) => {
  return (
    <div className="time-keeper-filter-wrapper">
      <div className="date-range-project-picker-wrapper">
        <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
        <FilterProjectPicker filter={filter} setFilter={setFilter} />
      </div>
      <TimeKeeperStats entries={entries} />
      <div className="new-entry-button-wrapper">
        <button
          onClick={() =>
            showEntryView ? setShowEntryView(false) : setShowEntryView(true)
          }
          className="new-entry-button"
        >
          New Entry
        </button>
      </div>
    </div>
  );
};
export default TimeKeeperFilter;
