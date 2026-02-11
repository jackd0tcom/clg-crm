import { useState } from "react";

const TimeKeeperSorter = ({ filter, setFilter }) => {
  const [showFilter, setShowFilter] = useState(false);

  const handleSort = (sortBy, sort) => {
    setFilter({ ...filter, sortBy: sortBy, sort: sort });
  };

  return (
    <div className="time-keeper-sorter-wrapper">
      <button className="time-keeper-sort-button">Sort By</button>
      {showFilter && (
        <div className="time-keeper-sort-overlay">
          <div className="time-keeper-sort-item">Date</div>
        </div>
      )}
    </div>
  );
};
export default TimeKeeperSorter;
