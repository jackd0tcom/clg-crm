import {
  getDuration,
  getAmountOfEntry,
  getRoundedDuration,
  getRoundedAmountOfEntry,
} from "../../helpers/helperFunctions";
import { useState } from "react";
import TimeEntryStatusBadge from "../UI/TimeEntryStatusBadge";
import axios from "axios";

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
  entryServices,
}) => {
  const [showTrash, setShowTrash] = useState(true);

  const rate = item.rate ?? defaultRate;

  const getServiceTitle = (id) => {
    return (
      entryServices.find((service) => service.entryServiceId === id)
        ?.serviceTitle ?? ""
    );
  };

  const handleRateChange = (e) => {
    setSomethingToSave(true);
    const newRate = Number(e.target.value);
    const currentData = [...groupedData];
    currentData[projectIndex][1][index].rate = newRate;
    setGroupedData(currentData);
  };

  const handleDeleteItem = async () => {
    try {
      await axios
        .post("/api/deleteEntryFromInvoice", {
          timeEntryId: item.timeEntryId,
        })
        .then((res) => {
          if (res.status === 200) {
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
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="invoice-item"
      onMouseEnter={() => setShowTrash(true)}
      onMouseLeave={() => setShowTrash(false)}
    >
      <p>{getServiceTitle(item.entryServiceId) ?? item.notes}</p>
      <TimeEntryStatusBadge status={item.paidStatus} />
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
