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
}) => {
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);

  const saveInput = () => {
    if (count !== 0) {
      try {
        // If it's a new case and we have a title, create the case first
        if (
          isNewCase &&
          caseId == 0 &&
          title &&
          title.trim() !== "Untitled Case"
        ) {
          console.log("new case Title");
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
      if (title && title.trim() !== "Untitled Case") {
        saveInput();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [title]);

  const handleBlur = () => {
    clearSaveTimer();
    saveInput();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      clearSaveTimer();
      saveInput();
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
        placeholder="Enter case title..."
      />
    </div>
  );
};
export default CaseInput;
