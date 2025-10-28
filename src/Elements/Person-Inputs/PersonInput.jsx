import { format } from "../../helpers/helperFunctions";
import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import InputMask from "react-input-mask";
import PhoneInput from "./PhoneInput";
import SSNInput from "./SSNInput";
import DOBInput from "./DOBInput";

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
}) => {
  const [input, setInput] = useState(value);
  const [count, setCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const isSavingRef = useRef(false);
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
    firstName: "John",
    lastName: "Doe",
    address: "1234 Cherry Ln",
    city: "Los Angeles",
    state: "CA",
    zip: "12345",
    phoneNumber: "(123) 456 - 7890",
    dob: "1999-01-01",
    county: "Los Angeles",
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

  const saveNumber = async () => {
    console.log("save Number");
    // Prevent duplicate saves
    if (isSavingRef.current || count === 0) {
      return;
    }

    const number = input.replace(/[^0-9]/g, "");

    if (value === number) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (isNewPerson) {
        await axios
          .post("/api/newPerson", { caseId, fieldName, value: number })
          .then((res) => {
            if (res.status === 200) {
              refreshActivityData();
              refreshCaseData();
              setCount(0);
              setIsNewPerson(false);
              setPersonId(res.data.personId);
            }
          });
      } else {
        await axios
          .post("/api/updatePerson", { personId, fieldName, value: number })
          .then((res) => {
            if (res.status === 200) {
              refreshActivityData();
              refreshCaseData();
              setCount(0);
            }
          });
      }
    } catch (error) {
      console.log(error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const saveInput = async () => {
    // Prevent duplicate saves
    if (isSavingRef.current || count === 0) {
      return;
    }
    console.log("save input", input);

    if (value === input) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (isNewPerson) {
        await axios
          .post("/api/newPerson", { caseId, fieldName, value: input })
          .then((res) => {
            if (res.status === 200) {
              refreshActivityData();
              refreshCaseData();
              setCount(0);
              setIsNewPerson(false);
              setPersonId(res.data.personId);
            }
          });
      } else {
        await axios
          .post("/api/updatePerson", { personId, fieldName, value: input })
          .then((res) => {
            console.log("saved", res.data);
            if (res.status === 200) {
              refreshActivityData();
              refreshCaseData();
              setCount(0);
            }
          });
      }
    } catch (error) {
      console.log(error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const saveTimer = useRef(null);

  const clearSaveTimer = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  };

  // Sets up save timer
  useEffect(() => {
    clearSaveTimer();
    saveTimer.current = setTimeout(() => {
      if (value && !isSavingRef.current) {
        saveInput();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [value]);

  const handleBlur = () => {
    clearSaveTimer();
    if (!isSavingRef.current) {
      if (fieldName === "phoneNumber" || fieldName === "SSN") {
        saveNumber();
      } else saveInput();
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      clearSaveTimer();
      if (!isSavingRef.current) {
        if (fieldName === "phoneNumber" || fieldName === "SSN") {
          saveNumber();
        } else saveInput();
      }
      inputRef.current.blur();
    }
  };

  // Handle autofill detection
  const handleAnimationStart = (e) => {
    if (e.animationName === "onAutoFillStart") {
      console.log("Autofill detected for:", fieldName);
      // Trigger save immediately when autofill occurs
      setInput(e.target.value);
      setCount((prevCount) => prevCount + 1);
      clearSaveTimer();
      // Save immediately after autofill
      setTimeout(() => {
        if (!isSavingRef.current) {
          saveInput();
        }
      }, 100);
    }
  };

  return (
    <div className="person-input-wrapper">
      <label className="person-input-label" id={fieldName}>
        {format(fieldName)}
      </label>
      <InputMask
        className="person-input-field"
        mask={masks[fieldName]}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setCount((prevCount) => prevCount + 1);
        }}
        formatChars={formats[fieldName]}
        inputRef={inputRef}
        onBlur={handleBlur}
        onKeyDown={handleEnter}
        placeholder={placeholders[fieldName]}
      ></InputMask>
    </div>
  );
};
export default PersonInput;
