import { useState } from "react";
import FilterDateRangeSelector from "./FilterDateRangeSelector";
import FilterProjectPicker from "./FilterProjectPicker";
import TimeKeeperSorter from "./TimeKeeperSorter";
import TimeKeeperStats from "./TimeKeeperStats";
import axios from "axios";
import { useNavigate } from "react-router";

const TimeKeeperFilter = ({
  filter,
  setFilter,
  entries,
  showEntryView,
  setShowEntryView,
}) => {
  const navigate = useNavigate();

  const newInvoice = async () => {
    const entryArray = entries.map((entry) => entry.timeEntryId);
    try {
      axios.post("/api/newInvoice", { entries: entryArray }).then((res) => {
        if (res.status === 200) {
          navigate(`/invoice/${res.data.invoiceId}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="time-keeper-filter-wrapper">
      <div className="date-range-project-picker-wrapper">
        <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
        <FilterProjectPicker filter={filter} setFilter={setFilter} />
      </div>
      <TimeKeeperStats entries={entries} />
      <div className="time-keeper-filter-buttons">
        <div className="new-entry-button-wrapper">
          <button onClick={() => newInvoice()} className="new-invoice-button">
            Create Invoice
          </button>
        </div>
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
    </div>
  );
};
export default TimeKeeperFilter;
