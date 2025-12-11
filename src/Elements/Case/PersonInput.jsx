import { format } from "../../helpers/helperFunctions";
import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import InputMask from "react-input-mask";

const PersonInput = ({
  fieldName,
  value,
  personId,
  refreshActivityData,
  refreshCaseData,
  isNewPerson,
  caseId,
  setPersonId,
  setIsNewPerson,
  type,
}) => {
  const [originalValue, setOriginalValue] = useState(value);
  const [input, setInput] = useState(value);
  const [count, setCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const isSavingRef = useRef(false);

  // Sync originalValue with the prop value when it changes externally
  useEffect(() => {
    setOriginalValue(value);
    setInput(value);
  }, [value]);
  const masks = {
    firstName: null,
    lastName: null,
    address: null,
    city: null,
    state: "aa",
    zip: "99999",
    phoneNumber: "(999) 999 - 9999",
    dob: "9999-99-99",
    county: null,
    SSN: "999 99 9999",
  };
  const placeholders = {
    firstName: "First Name",
    lastName: "Last Name",
    address: "Addresss",
    city: "City",
    state: "PA",
    zip: "12345",
    phoneNumber: "(000) 000 - 0000",
    dob: "2000-01-01",
    county: "County",
    SSN: "123 56 7890",
  };
  const formats = {
    firstName: "a",
    lastName: "a",
    address: "*",
    city: "a",
    state: null,
    zip: null,
    phoneNumber: null,
    dob: null,
    county: "a",
    SSN: null,
  };

  const saveInput = async (data) => {
    // Prevent duplicate saves
    if (isSavingRef.current || count === 0) {
      return;
    }

    // Normalize values for comparison (handle null/undefined/empty string)
    const normalizedValue = String(originalValue || "");
    const normalizedData = String(data || "");
    if (normalizedValue === normalizedData) {
      return;
    }

    // console.log(originalValue, "save input", data);

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (isNewPerson) {
        await axios
          .post("/api/newPerson", { caseId, fieldName, value: data, type })
          .then((res) => {
            if (res.status === 200) {
              setOriginalValue(data);
              refreshActivityData();
              refreshCaseData();
              setCount(0);
              setIsNewPerson(false);
              setPersonId(res.data.personId);
              setSuccess(true);
              setTimeout(() => {
                setSuccess(false);
              }, 2000);
            }
          });
      } else {
        await axios
          .post("/api/updatePerson", { personId, fieldName, value: data })
          .then((res) => {
            if (res.status === 200) {
              setOriginalValue(data);
              refreshActivityData();
              refreshCaseData();
              setCount(0);
              setSuccess(true);
              setTimeout(() => {
                setSuccess(false);
              }, 2000);
            }
          });
      }
    } catch (error) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
      console.log(error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (count === 0) {
      return;
    }
    if (!isSavingRef.current) {
      if (fieldName === "phoneNumber" || fieldName === "SSN") {
        const data = input.replace(/[^0-9]/g, "");
        saveInput(data);
      } else saveInput(input);
    }
  };

  const handleEnter = (e) => {
    setEditing(false);
    if (count === 0) {
      return;
    }
    if (e.key === "Enter") {
      if (!isSavingRef.current) {
        if (
          fieldName === "phoneNumber" ||
          fieldName === "SSN" ||
          fieldName === "zip"
        ) {
          const data = input.replace(/[^0-9]/g, "");
          saveInput(data);
        } else saveInput(input);
      }
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  // Handle autofill detection
  const handleAnimationStart = (e) => {
    if (e.animationName === "onAutoFillStart") {
      console.log("Autofill detected for:", fieldName);
      // Trigger save immediately when autofill occurs
      setInput(e.target.value);
      setCount((prevCount) => prevCount + 1);
      setEditing(true);
    }
  };

  return (
    <div className="person-input-wrapper">
      <div className="person-input-label-wrapper">
        <label className="person-input-label" id={fieldName}>
          {format(fieldName)}
        </label>
        {success && (
          <p className="person-save-message">
            Saved <i className="fa-solid fa-check"></i>
          </p>
        )}
        {error && (
          <p className="person-error-message">
            Not Saved <i className="fa-solid fa-exclamation"></i>
          </p>
        )}
      </div>
      <div className="person-input-container">
        <InputMask
          className="person-input-field"
          mask={masks[fieldName]}
          value={input}
          onChange={(e) => {
            const newValue = e.target.value;
            // Normalize both values to strings for proper comparison
            const normalizedNewValue = String(newValue || "");
            const normalizedOriginalValue = String(originalValue || "");
            setEditing(normalizedNewValue !== normalizedOriginalValue);
            setInput(newValue);
            setCount((prevCount) => prevCount + 1);
          }}
          formatChars={formats[fieldName]}
          inputRef={inputRef}
          onBlur={handleBlur}
          onKeyDown={handleEnter}
          placeholder={placeholders[fieldName]}
        ></InputMask>
        {editing && (
          <p onClick={handleBlur} className="person-input-save">
            Save
          </p>
        )}
      </div>
    </div>
  );
};
export default PersonInput;
