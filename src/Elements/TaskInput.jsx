import { useState, useRef, useEffect } from "react";
import axios from "axios";

const TaskInput = ({
  title,
  setTitle,
  taskId,
  refreshTaskActivityData,
  newTask,
  setNewTask,
  setTaskId,
  refreshTasks,
}) => {
  const [count, setCount] = useState(0);
  const [localTitle, setLocalTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
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

  const saveNewTask = async () => {
    if (isSaving) return; // Prevent duplicate saves
    
    try {
      setIsSaving(true);
      console.log("new task");
      await axios
        .post("/api/newTask", {
          title: localTitle || "",
          notes: "",
          caseId: null,
          dueDate: null,
          priority: "normal",
          status: "not started",
        })
        .then((res) => {
          if (res.status === 201) {
            console.log(res.data);
            setNewTask(false);
            setTaskId(res.data.taskId);
            // Refresh the task list to show the new task
            if (refreshTasks) {
              refreshTasks();
            }
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
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
    if (count > 0 && !isSaving) {
      // Only save if user has actually typed and not currently saving
      clearSaveTimer();
      saveTimer.current = setTimeout(() => {
        if (localTitle && localTitle.trim() !== "Untitled Case") {
          if (newTask) {
            saveNewTask();
          } else saveTask("title", localTitle);
        }
      }, 2000);
      return () => {
        clearSaveTimer();
      };
    }
  }, [localTitle, count, isSaving]);

  const handleBlur = () => {
    if (count > 0 && !isSaving) {
      // Only save if user has actually typed and not currently saving
      clearSaveTimer();
      if (newTask) {
        saveNewTask();
      } else saveTask("title", localTitle);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      if (count > 0 && !isSaving) {
        // Only save if user has actually typed and not currently saving
        clearSaveTimer();
        if (newTask) {
          saveNewTask();
        } else saveTask("title", localTitle);
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
          if (newTask) {
            setTitle(newTitle); // Update parent state
          }
          setCount((prevCount) => prevCount + 1);
        }}
        onBlur={handleBlur}
        onKeyDown={handleEnter}
        placeholder="Task title"
      />
    </div>
  );
};

export default TaskInput;
