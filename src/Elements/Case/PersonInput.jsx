import { format } from "../../helpers/helperFunctions";
import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import { useMaskito } from "@maskito/react";
import { maskitoTransform } from "@maskito/core";

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
  const [errorMessage, setErrorMessage] = useState("Not Saved");
  // const inputRef = useRef(null);
  const isSavingRef = useRef(false);

  // Sync originalValue with the prop value when it changes externally
  useEffect(() => {
    setOriginalValue(value);
    setInput(formatInputValue(value));
  }, [value]);

  const masks = {
    firstName: { mask: /^[a-zA-Z]+$/ },
    lastName: { mask: /^[a-zA-Z]+$/ },
    address: null,
    city: { mask: /^[a-zA-Z]+$/ },
    state: { mask: /^[a-zA-Z]+$/ },
    zip: { mask: /^\d{0,6}$/ },
    phoneNumber: {
      mask: [
        "(",
        /\d/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ],
    },
    dob: {
      mask: [/\d/, /\d/, "-", /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/],
    },
    county: { mask: /^[a-zA-Z]+$/ },
    SSN: {
      mask: [/\d/, /\d/, /\d/, " ", /\d/, /\d/, " ", /\d/, /\d/, /\d/, /\d/],
    },
  };

  const placeholders = {
    firstName: "First Name",
    lastName: "Last Name",
    address: "Addresss",
    city: "City",
    state: "PA",
    zip: "12345",
    phoneNumber: "(000) 000 - 0000",
    dob: "DD-MM-YYYY",
    county: "County",
    SSN: "123 56 7890",
    email: "Email",
  };

  // formats / saves dob date
  const formatDate = (value) => {
    const dobArray = input.split("-");
    if (dobArray[1] > 12) {
      setErrorMessage("DD-MM-YYYY");
      setError(true);
      setTimeout(() => {
        setError(false);
        setErrorMessage("Not Saved");
      }, 1500);
      return;
    } else {
      const string = `${dobArray[2]}-${dobArray[1]}-${dobArray[0]}`;
      saveInput(string);
    }
  };

  // formats incoming values from db
  const formatInputValue = (val) => {
    const mask = masks[fieldName];
    if (!mask || !val) return val || "";

    if (fieldName === "dob") {
      const dobValArray = val.split("-");
      const formattedDob = `${dobValArray[2]}-${dobValArray[1]}-${dobValArray[0]}`;
      return formattedDob;
    }

    return maskitoTransform(String(val), mask);
  };

  // ref for maskito
  const maskedInputRef = useMaskito({ options: masks[fieldName] });

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
              console.log(res.data, data);
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
      if (fieldName === "dob") {
        formatDate();
        return;
      }
      if (
        fieldName === "phoneNumber" ||
        fieldName === "SSN" ||
        fieldName === "zip"
      ) {
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
        if (fieldName === "dob") {
          formatDate();
          return;
        }
        if (
          fieldName === "phoneNumber" ||
          fieldName === "SSN" ||
          fieldName === "zip"
        ) {
          const data = input.replace(/[^0-9]/g, "");
          saveInput(data);
        } else saveInput(input);
      }
      if (maskedInputRef.current) {
        maskedInputRef.current.blur();
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
          {format(fieldName)}{" "}
        </label>
        {success && (
          <p className="person-save-message">
            Saved <i className="fa-solid fa-check"></i>
          </p>
        )}
        {error && (
          <p className="person-error-message">
            {errorMessage}
            <i className="fa-solid fa-exclamation"></i>
          </p>
        )}
      </div>
      <div className="person-input-container">
        {fieldName !== "email" && (
          <input
            className="person-input-field"
            ref={maskedInputRef}
            placeholder={placeholders[fieldName]}
            value={input}
            onBlur={handleBlur}
            onKeyDown={handleEnter}
            onChange={(e) => {
              const newValue = e.target.value;
              // Normalize both values to strings for proper comparison
              const normalizedNewValue = String(newValue || "");
              const normalizedOriginalValue = String(originalValue || "");
              setEditing(normalizedNewValue !== normalizedOriginalValue);
              setInput(newValue);
              setCount((prevCount) => prevCount + 1);
            }}
          />
        )}
        {type === "adverse" && fieldName === "email" && (
          <input
            className="person-input-field"
            ref={maskedInputRef}
            placeholder={placeholders[fieldName]}
            value={input}
            onBlur={handleBlur}
            onKeyDown={handleEnter}
            onChange={(e) => {
              const newValue = e.target.value;
              // Normalize both values to strings for proper comparison
              const normalizedNewValue = String(newValue || "");
              const normalizedOriginalValue = String(originalValue || "");
              setEditing(normalizedNewValue !== normalizedOriginalValue);
              setInput(newValue);
              setCount((prevCount) => prevCount + 1);
            }}
          />
        )}
        {type === "opposing" && fieldName === "email" && (
          <textarea
            id="person-input-textarea"
            className="person-input-field"
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
            inputRef={maskedInputRef}
            onBlur={handleBlur}
            placeholder={placeholders[fieldName]}
          ></textarea>
        )}
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
