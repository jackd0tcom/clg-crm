import {
  getDuration,
  getAmountOfEntry,
  getRoundedDuration,
  getRoundedAmountOfEntry,
} from "../../helpers/helperFunctions";
import { useState } from "react";

const InvoiceItem = ({
  groupedData,
  setGroupedData,
  item,
  defaultRate,
  index,
  projectIndex,
  rounding,
  setSomethingToSave,
  status,
}) => {
  const [rate, setRate] = useState(item.rate ?? defaultRate);
  const [showTrash, setShowTrash] = useState(true);

  const handleRateChange = (e) => {
    setSomethingToSave(true);
    setRate(e.target.value);
    const currentData = [...groupedData];
    currentData[projectIndex][1][index].rate = e.target.value;
    setGroupedData(currentData);
  };

  const handleDeleteItem = () => {
    setSomethingToSave(true);
    const newItems = groupedData[projectIndex][1].filter(
      (_, idx) => idx !== index,
    );
    if (newItems.length < 1) {
      setGroupedData(groupedData.filter((_, i) => i !== projectIndex));
    } else {
      setGroupedData(
        groupedData.map((group, i) =>
          i === projectIndex ? [group[0], newItems] : group,
        ),
      );
    }
  };

  return (
    <div
      className="invoice-item"
      onMouseEnter={() => setShowTrash(true)}
      onMouseLeave={() => setShowTrash(false)}
    >
      <p>{item.notes}</p>
      {status !== "draft" ? (
        <p>{rate}</p>
      ) : (
        <input
          type="number"
          value={rate}
          onChange={(e) => handleRateChange(e)}
        />
      )}

      <p>{getRoundedDuration(item, rounding)}</p>
      <div className="amount-wrapper">
        <p>{getRoundedAmountOfEntry(rate, item, rounding)}</p>
      </div>
      {status === "draft" && showTrash && (
        <div className="trash-wrapper">
          <i
            onClick={() => handleDeleteItem()}
            className="fa-solid fa-trash trash-button"
          ></i>
        </div>
      )}
    </div>
  );
};
export default InvoiceItem;
