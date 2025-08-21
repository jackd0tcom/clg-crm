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
}) => {
  const [input, setInput] = useState(value);
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);

  const saveInput = () => {
    if (count !== 0) {
      try {
        axios
          .post("/api/updatePerson", { personId, fieldName, value: input })
          .then((res) => {
            if (res.status === 200) {
              console.log(res);
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
        ref={inputRef}
      />
    </div>
  );
};
export default PersonInput;
