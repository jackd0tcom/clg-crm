import { useRef, useLayoutEffect } from "react";

const Notes = ({
  value,
  onChange,
  setCount,
  count,
  updateNotes,
  saveNotesKeepalive,
}) => {
  const saveTimer = useRef(null);
  const valueRef = useRef(value);
  const isDirtyRef = useRef(false);
  const updateNotesRef = useRef(updateNotes);
  const saveNotesKeepaliveRef = useRef(saveNotesKeepalive);

  updateNotesRef.current = updateNotes;
  saveNotesKeepaliveRef.current = saveNotesKeepalive;

  if (count === 0) {
    isDirtyRef.current = false;
    valueRef.current = value;
  }

  const clearSaveTimer = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  };

  const flushNotes = () => {
    if (!isDirtyRef.current) return;
    isDirtyRef.current = false;
    updateNotesRef.current(valueRef.current);
  };

  const scheduleSave = () => {
    clearSaveTimer();
    saveTimer.current = setTimeout(flushNotes, 2000);
  };

  const handleChange = (e) => {
    const nextValue = e.target.value;
    valueRef.current = nextValue;
    isDirtyRef.current = true;
    onChange(nextValue);
    setCount((prevCount) => prevCount + 1);
    scheduleSave();
  };

  const handleBlur = () => {
    clearSaveTimer();
    flushNotes();
  };

  useLayoutEffect(() => {
    return () => {
      clearSaveTimer();
      if (!isDirtyRef.current) return;
      if (saveNotesKeepaliveRef.current) {
        saveNotesKeepaliveRef.current(valueRef.current);
      } else {
        updateNotesRef.current(valueRef.current);
      }
    };
  }, []);

  return (
    <div className="notes-wrapper">
      <h3 className="notes-heading">Notes</h3>
      <textarea
        onChange={handleChange}
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
