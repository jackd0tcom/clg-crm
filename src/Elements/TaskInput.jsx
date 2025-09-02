import { useState, useRef, useEffect } from "react";

const TaskInput = ({ title, setTitle, taskId }) => {
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);
  const saveTimer = useRef(null);

  const saveTask = async (key, value) => {
    try {
      await axios.post("/api/updateTask", { taskId, key, value });
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

  useEffect(() => {
    clearSaveTimer();
    saveTimer.current = setTimeout(() => {
      if (title && title.trim() !== "Untitled Case") {
        saveTask();
      }
    }, 2000);
    return () => {
      clearSaveTimer();
    };
  }, [title]);

  const handleBlur = () => {
    clearSaveTimer();
    saveTask();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      clearSaveTimer();
      saveTask();
      inputRef.current.blur();
    }
  };

  return (
    <div className="task-input-wrapper">
      <input
        type="text"
        value={title}
        id={title}
        onChange={(e) => {
          setTitle(e.target.value);
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
