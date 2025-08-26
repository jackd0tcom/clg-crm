import { format } from "../helpers/helperFunctions";
import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";

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
  const inputRef = useRef(null);

  const saveInput = async () => {
    if (count !== 0) {
      try {
        if (isNewPerson) {
          await axios
            .post("/api/newPerson", { caseId, fieldName, value: input })
            .then((res) => {
              if (res.status === 200) {
                console.log("new person added");
                refreshActivityData();
                refreshCaseData();
                setCount(0);
                setIsNewPerson(false);
                setPersonId(res.data.personId);
              }
            });
        } else
          await axios
            .post("/api/updatePerson", { personId, fieldName, value: input })
            .then((res) => {
              if (res.status === 200) {
                refreshActivityData();
                refreshCaseData();
                setCount(0);
              }
            });
      } catch (error) {
        console.log(error);
      }
    } else return;
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
      if (value) {
        saveInput();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [value]);

  const handleBlur = () => {
    clearSaveTimer();
    saveInput();
  };
  
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      console.log("Enter");
      clearSaveTimer();
      saveInput();
      inputRef.current.blur();
    }
  };

  // Handle autofill detection
  const handleAnimationStart = (e) => {
    if (e.animationName === 'onAutoFillStart') {
      console.log('Autofill detected for:', fieldName);
      // Trigger save immediately when autofill occurs
      setInput(e.target.value);
      setCount(prevCount => prevCount + 1);
      clearSaveTimer();
      // Save immediately after autofill
      setTimeout(() => saveInput(), 100);
    }
  };

  return (
    <div className="person-input-wrapper">
      <label id={fieldName} htmlFor={fieldName}>
        {format(fieldName)}
      </label>
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
    </div>
  );
};
export default PersonInput;
