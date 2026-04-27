import { useState } from "react";

const isSameCharge = (row, item) => {
  if (item.chargeId != null) {
    return row.chargeId === item.chargeId;
  }
  return item.clientKey != null && row.clientKey === item.clientKey;
};

const CustomChargeItem = ({
  item,
  invoiceData,
  setInvoiceData,
  index,
  setSomethingToSave,
  status,
}) => {
  const [amount, setAmount] = useState(item.amount);
  const [description, setDescription] = useState(item.description);
  const [showTrash, setShowTrash] = useState(false);

  const handleAmountChange = (e) => {
    setSomethingToSave(true);
    setInvoiceData((prev) => ({
      ...prev,
      customCharges: (prev.customCharges ?? []).map((charge) =>
        isSameCharge(charge, item)
          ? { ...charge, amount: e.target.value }
          : charge,
      ),
    }));
  };
  const handleDescriptionChange = (e) => {
    setSomethingToSave(true);
    setInvoiceData((prev) => ({
      ...prev,
      customCharges: (prev.customCharges ?? []).map((charge) =>
        isSameCharge(charge, item)
          ? { ...charge, description: e.target.value }
          : charge,
      ),
    }));
  };
  const handleDeleteItem = () => {
    setSomethingToSave(true);
    setInvoiceData((prev) => ({
      ...prev,
      customCharges: (prev.customCharges ?? []).filter(
        (charge) => !isSameCharge(charge, item),
      ),
    }));
  };

  return (
    <div
      className="invoice-item custom-charge-item"
      onMouseEnter={() => setShowTrash(true)}
      onMouseLeave={() => setShowTrash(false)}
    >
      {status !== "draft" ? (
        <p>{item.description ?? ""}</p>
      ) : (
        <input
          type="text"
          value={item.description ?? ""}
          onChange={(e) => handleDescriptionChange(e)}
          className="custom-charge-description"
        />
      )}
      <p></p>
      <p></p>
      <p></p>
      <div className="amount-wrapper">
        {status !== "draft" ? (
          <p>{item.amount ?? ""}</p>
        ) : (
          <input
            type="number"
            value={item.amount ?? ""}
            onChange={(e) => handleAmountChange(e)}
            className="custom-charge-amount"
          />
        )}
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
export default CustomChargeItem;
