import { useState, useRef } from "react";

interface props {
  updateRate: any;
  rate: any;
}

const RateInput = ({ updateRate, rate }: props) => {
  const [somethingToSave, setSomethingToSave] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rate-input-wrapper">
      <div className="rate-input-container">
        <p>{rate.rateTitle}</p>
        <input
          ref={inputRef}
          type="number"
          defaultValue={rate.rate}
          onChange={(e) => {
            setSomethingToSave(e.target.value !== String(rate.rate));
          }}
        />
      </div>
      {somethingToSave && (
        <button
          className="save-rate-button"
          onClick={() => {
            updateRate(rate.rateId, inputRef.current?.value);
            setSomethingToSave(false);
          }}
        >
          Save
        </button>
      )}
    </div>
  );
};
export default RateInput;
