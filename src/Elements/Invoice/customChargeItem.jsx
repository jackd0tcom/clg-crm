import { useState } from "react";

const CustomChargeItem = ({ item, invoiceData, setInvoiceData, index }) => {
  const [amount, setAmount] = useState(item.amount);
  const [description, setDescription] = useState(item.description);
  const [showTrash, setShowTrash] = useState(false);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setInvoiceData({
      ...invoiceData,
      customCharges: invoiceData.customCharges.map((charge, i) =>
        i === index ? { ...charge, amount: e.target.value } : charge,
      ),
    });
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setInvoiceData({
      ...invoiceData,
      customCharges: invoiceData.customCharges.map((charge, i) =>
        i === index ? { ...charge, description: e.target.value } : charge,
      ),
    });
  };

  const handleDeleteItem = () => {
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
      <input
        type="text"
        value={description}
        onChange={(e) => handleDescriptionChange(e)}
        className="custom-charge-description"
      />
      <p></p>
      <p></p>
      <div className="amount-wrapper">
        <input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(e)}
          className="custom-charge-amount"
        />
      </div>
      {showTrash && (
        <i
          onClick={() => handleDeleteItem()}
          className="fa-solid fa-trash trash-button"
        ></i>
      )}
    </div>
  );
};
export default CustomChargeItem;
