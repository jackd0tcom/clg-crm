import { useState, useRef, useEffect } from "react";
import axios from "axios";

const TaskInput = ({ title, setTitle, taskId, refreshTaskActivityData }) => {
  const [count, setCount] = useState(0);
  const [localTitle, setLocalTitle] = useState(title);
  const inputRef = useRef(null);
  const saveTimer = useRef(null);

  // Update local title when prop changes (but don't save)
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const saveTask = async (fieldName, value) => {
    try {
      console.log("saving", count);
      await axios
        .post("/api/updateTask", { taskId, fieldName, value })
        .then((res) => {
          setCount(0);
          refreshTaskActivityData();
        });
      console.log(count);
    } catch (error) {
      console.log(error);
    }
  };

  const clearSaveTimer = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  };

  // Only save when local title changes (user input)
  useEffect(() => {
    if (count > 0) {
      // Only save if user has actually typed
      clearSaveTimer();
      saveTimer.current = setTimeout(() => {
        if (localTitle && localTitle.trim() !== "Untitled Case") {
          saveTask("title", localTitle);
        }
      }, 2000);
      return () => {
        clearSaveTimer();
      };
    }
  }, [localTitle, count]);

  const handleBlur = () => {
    if (count > 0) {
      // Only save if user has actually typed
      clearSaveTimer();
      saveTask("title", localTitle);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      if (count > 0) {
        // Only save if user has actually typed
        clearSaveTimer();
        saveTask("title", localTitle);
      }
      inputRef.current.blur();
    }
  };

  return (
    <div className="task-input-wrapper" ref={inputRef}>
      <input
        type="text"
        value={localTitle}
        id={localTitle}
        onChange={(e) => {
          const newTitle = e.target.value;
          setLocalTitle(newTitle);
          setTitle(newTitle); // Update parent state
          setCount((prevCount) => prevCount + 1);
        }}
        onBlur={handleBlur}
        onKeyDown={handleEnter}
        placeholder="Enter task title..."
      />
    </div>
  );
};

export default TaskInput;
