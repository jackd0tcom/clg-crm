import { useRef } from "react";
import { useEffect } from "react";

const Notes = ({ value, onChange, setCount, count, updateNotes }) => {
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
        updateNotes();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [value]);

  const handleBlur = () => {
    clearSaveTimer();
    updateNotes();
  };

  return (
    <div className="notes-wrapper">
      <h3>Notes</h3>
      <textarea
        onChange={(e) => {
          onChange(e.target.value);
          setCount((prevCount) => prevCount + 1);
        }}
        name="notes"
        id=""
        className="notes-textarea"
        value={value}
        onBlur={handleBlur}
      ></textarea>
    </div>
  );
};

export default Notes;
