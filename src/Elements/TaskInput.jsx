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
  openTaskView,
  date,
  caseId,
  refreshCaseData,
  refreshActivityData,
}) => {
  const [count, setCount] = useState(0);
  const [localTitle, setLocalTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [dueDate, setDueDate] = useState();
  const inputRef = useRef(null);
  const saveTimer = useRef(null);
  const now = new Date();

  // Update local title when prop changes (but don't save)
  useEffect(() => {
    if (date) {
      if (date === "Upcoming") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow);
      } else if (date === "Due Today") {
        setDueDate(now);
      } else if (date === "Overdue") {
        setDueDate(null);
      }
    }
    setLocalTitle(title);
  }, [title, date]);

  useEffect(() => {
    if (newTask && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [newTask]);

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
          caseId: caseId || null,
          dueDate: dueDate,
          priority: "normal",
          status: "not started",
        })
        .then((res) => {
          if (res.status === 201) {
            setNewTask(false);
            setTaskId(res.data.taskId);
            if (refreshCaseData) {
              refreshCaseData();
              refreshActivityData();
            }
            if (refreshTasks) {
              refreshTasks();
            }
            if (openTaskView && res.data.taskId) {
              console.log(res.data.taskId);
              openTaskView(res.data.taskId);
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
    if (newTask && count === 0) {
      setNewTask(false);
      return;
    }

    if (count > 0 && !isSaving) {
      // Only save if user has actually typed and not currently saving
      clearSaveTimer();
      if (newTask) {
        saveNewTask();
      } else saveTask("title", localTitle);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Escape") {
      setNewTask(false);
      return;
    }
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
        autoFocus={newTask}
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
