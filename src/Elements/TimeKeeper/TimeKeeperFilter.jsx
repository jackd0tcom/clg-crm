import FilterDateRangeSelector from "./FilterDateRangeSelector";
import FilterProjectPicker from "./FilterProjectPicker";
import TimeKeeperStats from "./TimeKeeperStats";
import FilterStatusPicker from "./FilterStatusPicker";
import EntriesUserPicker from "./EntriesUserPicker";

const TimeKeeperFilter = ({
  filter,
  setFilter,
  entries,
  getAllEntries,
  showAllEntries,
  setShowAllEntries,
  setIsLoading,
}) => {
  return (
    <div className="time-keeper-filter-wrapper">
      <div className="date-range-project-picker-wrapper">
        <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
        <FilterProjectPicker filter={filter} setFilter={setFilter} />
        <FilterStatusPicker filter={filter} setFilter={setFilter} />
        <EntriesUserPicker
          setIsLoading={setIsLoading}
          getAllEntries={getAllEntries}
          setShowAllEntries={setShowAllEntries}
          showAllEntries={showAllEntries}
        />
      </div>
      <TimeKeeperStats entries={entries} />
    </div>
  );
};
export default TimeKeeperFilter;
