import { format } from "../../helpers/helperFunctions";
import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import PhoneInput from "./PhoneInput";
import SSNInput from "./SSNInput";

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

  const saveNumber = async () => {
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
      if (fieldName === "phoneNumber" || "SSN") {
        saveNumber();
      } else saveInput();
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      clearSaveTimer();
      if (!isSavingRef.current) {
        if (fieldName === "phoneNumber" || "SSN") {
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
      {fieldName === "phoneNumber" ? (
        <PhoneInput
          input={input}
          setInput={setInput}
          handleBlur={handleBlur}
          handleEnter={handleEnter}
          inputRef={inputRef}
          setCount={setCount}
        />
      ) : fieldName === "SSN" ? (
        <SSNInput
          input={input}
          setInput={setInput}
          handleBlur={handleBlur}
          handleEnter={handleEnter}
          inputRef={inputRef}
          setCount={setCount}
        />
      ) : (
        <input
          onChange={(e) => {
            setInput(e.target.value);
            setCount((prevCount) => prevCount + 1);
          }}
          id={fieldName}
          name={fieldName}
          type="text"
          value={input}
          onBlur={handleBlur}
          onKeyDown={handleEnter}
          onAnimationStart={handleAnimationStart}
          ref={inputRef}
          className="person-input-field"
          autoComplete="on"
        />
      )}
    </div>
  );
};
export default PersonInput;
