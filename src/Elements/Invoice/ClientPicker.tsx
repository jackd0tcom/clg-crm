import { useEffect, useState, useRef } from "react";

interface props {
  clientName: string;
  clientList: any;
  setPayment: any;
  payment: any;
}

const ClientPicker = ({
  clientName,
  clientList,
  setPayment,
  payment,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="client-picker-wrapper relative">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {clientName}
      </button>
      {showDropdown && (
        <div className="dropdown" ref={dropdownRef}>
          {clientList?.map((client: any) => (
            <div
              className="dropdown-item"
              onClick={() => {
                setPayment({ ...payment, personId: client.personId });
                setShowDropdown(false);
              }}
            >
              {client.firstName ?? ""} {client.lastName ?? ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientPicker;
