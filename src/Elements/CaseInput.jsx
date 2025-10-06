import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";

const CaseInput = ({
  title,
  setTitle,
  refreshActivityData,
  refreshCaseData,
  caseId,
  isNewCase,
  newCase,
  isCreatingCase,
}) => {
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);

  // Auto-focus the input when it's a new case
  useEffect(() => {
    if (isNewCase && caseId == 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNewCase, caseId]);

  const saveInput = () => {
    if (count !== 0) {
      try {
        // If it's a new case and we have a title, create the case first
        if (
          isNewCase &&
          caseId == 0 &&
          title &&
          title.trim() !== "Untitled Case" &&
          !isCreatingCase
        ) {
          newCase();
          return;
        }

        // Otherwise, update existing case
        axios
          .post("/api/updateCase", { caseId, fieldName: "title", value: title })
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
      if (title && title.trim() !== "Untitled Case" && !isCreatingCase) {
        saveInput();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [title, isCreatingCase]);

  const handleBlur = () => {
    clearSaveTimer();
    if (!isCreatingCase) {
      saveInput();
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      clearSaveTimer();
      if (!isCreatingCase) {
        saveInput();
      }
      inputRef.current.blur();
    }
  };

  return (
    <div className="case-input-wrapper">
      <input
        className="case-title-input"
        type="text"
        id={title}
        name={title}
        ref={inputRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setCount((prevCount) => prevCount + 1);
        }}
        onBlur={handleBlur}
        onKeyDown={handleEnter}
        placeholder="Add case title"
      />
    </div>
  );
};
export default CaseInput;
