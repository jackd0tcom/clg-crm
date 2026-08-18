import { useState, useEffect, useRef } from "react";
import UIDatePicker from "../UI/DatePicker";
import ClientPicker from "./ClientPicker";

interface props {
  project: any;
  handlePay: any;
  existingPayment: any;
  clientList: any;
  icon: boolean;
  right?: boolean;
}

// function isShallowEqual(obj1: any, obj2: any) {
//   const keys1 = Object.keys(obj1);
//   const keys2 = Object.keys(obj2);

//   if (keys1.length !== keys2.length) return false;

//   return keys1.every((key) => obj1[key] === obj2[key]);
// }

const PayModal = ({
  project,
  existingPayment,
  handlePay,
  clientList,
  icon,
  right,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDescriptionDropDown, setShowDescriptionDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const descriptionDropdownRef = useRef<HTMLInputElement>(null);

  const [payment, setPayment] = useState({
    paidDate: existingPayment?.paidDate ?? new Date(),
    paidAmount: existingPayment?.paidAmount ?? 0,
    paidDescription: existingPayment?.paidDescription ?? "",
    personId: project?.billableContact ?? existingPayment?.personId ?? 0,
  });
  const descriptions = ["Retainer Payment", "Invoice Payment"];

  const foundClient = clientList?.find(
    (client: any) => client?.personId === payment?.personId,
  );

  const clientName = foundClient
    ? `${foundClient?.firstName ?? ""} ${foundClient?.lastName ?? ""}`
    : "Select a client";

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        descriptionDropdownRef.current &&
        !descriptionDropdownRef.current.contains(event.target)
      ) {
        setShowDescriptionDropdown(false);
      }
    };

    if (showDescriptionDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDescriptionDropDown]);

  const onDateChange = (date: any) => {
    setPayment({ ...payment, paidDate: date });
  };

  let readyToSave;
  readyToSave = payment.paidAmount > 0 && payment.paidDescription !== "";

  return (
    <div className="pay-modal-wrapper relative">
      <button
        className={!icon ? "submit-payment-button" : "submit-payment-icon"}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {icon ? (
          <i className="fa-solid fa-comment-dollar pay-modal-icon"></i>
        ) : (
          "Add Payment"
        )}
      </button>
      {showDropdown && (
        <div
          className={right ? "dropdown pay-modal right" : "dropdown pay-modal"}
          ref={dropdownRef}
        >
          <div className="pay-modal-header">
            <h4>{project?.invoiceId ? "Invoice" : "Case"} Payment</h4>
          </div>
          <div className="pay-modal-body">
            <div className="pay-modal-item">
              <p>Date</p>
              <UIDatePicker
                currentDate={payment.paidDate}
                onDateChange={onDateChange}
                clearable={false}
              />
            </div>
            <div className="pay-modal-item">
              <p>Client:</p>
              <ClientPicker
                clientName={clientName}
                clientList={clientList}
                payment={payment}
                setPayment={setPayment}
              />
            </div>
            <div className="pay-modal-item">
              <p>Amount</p>
              <span className="pay-modal-amount">
                $
                <input
                  type="number"
                  value={payment.paidAmount}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) =>
                    setPayment({
                      ...payment,
                      paidAmount: Number(e.target.value),
                    })
                  }
                />
              </span>
            </div>
            <div className="pay-modal-item relative">
              <p>Description</p>
              <button
                className="pay-modal-description-button"
                onClick={() =>
                  setShowDescriptionDropdown(!showDescriptionDropDown)
                }
              >
                {payment.paidDescription === ""
                  ? "Select a Description"
                  : payment.paidDescription}
              </button>
              {showDescriptionDropDown && (
                <div
                  className="dropdown pay-modal-description"
                  ref={descriptionDropdownRef}
                >
                  {descriptions.map((item: any) => (
                    <div
                      className="dropdown-item pay-modal-description-item"
                      onClick={() => {
                        setPayment({ ...payment, paidDescription: item });
                        setShowDescriptionDropdown(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {readyToSave && (
              <button
                className="pay-modal-save"
                onClick={() => {
                  handlePay(payment);
                  setPayment({
                    paidDate: new Date(),
                    paidAmount: 0,
                    paidDescription: "",
                    personId: 0,
                  });
                  setShowDropdown(false);
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PayModal;
