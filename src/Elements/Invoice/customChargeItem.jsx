import { useState } from "react";

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
    setAmount(e.target.value);
    setInvoiceData({
      ...invoiceData,
      customCharges: invoiceData.customCharges.map((charge, i) =>
        i === index ? { ...charge, amount: e.target.value } : charge,
      ),
    });
  };

  const handleDescriptionChange = (e) => {
    setSomethingToSave(true);
    setDescription(e.target.value);
    setInvoiceData({
      ...invoiceData,
      customCharges: invoiceData.customCharges.map((charge, i) =>
        i === index ? { ...charge, description: e.target.value } : charge,
      ),
    });
  };

  const handleDeleteItem = () => {
    setSomethingToSave(true);
    const newCharges = invoiceData.customCharges.filter(
      (charge, idx) => idx !== index,
    );
    setInvoiceData({
      ...invoiceData,
      customCharges: newCharges,
    });
  };

  return (
    <div
      className="invoice-item custom-charge-item"
      onMouseEnter={() => setShowTrash(true)}
      onMouseLeave={() => setShowTrash(false)}
    >
      {status !== "draft" ? (
        <p>{description}</p>
      ) : (
        <input
          type="text"
          value={description}
          onChange={(e) => handleDescriptionChange(e)}
          className="custom-charge-description"
        />
      )}
      <p></p>
      <p></p>
      <div className="amount-wrapper">
        {status !== "draft" ? (
          <p>{amount}</p>
        ) : (
          <input
            type="number"
            value={amount}
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
