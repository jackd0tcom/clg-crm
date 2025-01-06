import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Writer = () => {
  const [storyContent, SetStoryContent] = useState("");
  const [storyTitle, SetStoryTitle] = useState("");
  const [storyIdState, SetStoryIdState] = useState(0);
  const [savedStatus, setSavedStatus] = useState("Saved");
  const [changeCount, setChangeCount] = useState(0);
  const debounceTimer = useRef(null);
  const { storyId } = useParams();
  const userId = useSelector((state) => state.userId);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStory() {
      try {
        if (storyId) {
          await axios.post("/api/getStory", { storyId }).then((res) => {
            if (res.data.userId === userId) {
              SetStoryContent(res.data.content);
              SetStoryTitle(res.data.title);
              SetStoryIdState(res.data.storyId);
            } else navigate("/restricted");
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (changeCount >= 100) {
      autoSave();
      setChangeCount(0);
    }
    const handleBeforeUnload = () => autoSave();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [changeCount]);

  async function autoSave() {
    try {
      setSavedStatus("AutoSaving...");
      const res = await axios.post("/api/saveStory", {
        storyContent,
        storyTitle,
        storyId: storyIdState,
      });
      if (res.status === 200) {
        console.log("saved");
        setIsSaved(true);
        setTimeout(() => {
          setSavedStatus("Saved");
          setIsSaved(false);
        }, 1500);
      } else {
        setSavedStatus("Failed to Save!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleTitleChange = (e) => {
    SetStoryTitle(e.target.value);
    setChangeCount((prev) => prev + 1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      console.log("title change debounce autosave");
      autoSave();
    }, 5000);
  };

  const handleContentChange = (e) => {
    SetStoryContent(e.target.value);
    setChangeCount((prev) => prev + 1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      console.log("content change debounce autosave");
      autoSave();
    }, 5000);
  };

  const save = async (e) => {
    e.preventDefault();
    setSavedStatus("Saving...");
    try {
      if (storyIdState !== 0) {
        const res = await axios.post("/api/saveStory", {
          storyContent,
          storyTitle,
          storyId: storyIdState,
        });
        if (res.status === 200) {
          console.log("saved");
          setIsSaved(true);
          setTimeout(() => {
            setSavedStatus("Saved");
            setIsSaved(false);
          }, 1500);
        } else {
          setSavedStatus("Failed to Save!");
        }
      } else {
        const res = await axios.post("/api/newStory", {
          storyContent,
          storyTitle,
        });
        SetStoryIdState(res.data.storyId);
      }
    } catch (error) {
      console.log(error);
      setSavedStatus("Failed to Save!");
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          console.log(storyIdState);
        }}
      >
        Story Id
      </button>
      <form className="writer-wrapper" onSubmit={save}>
        <div className="story-title-wrapper">
          <textarea
            className="story-title"
            name="storyTitle"
            id="storyTitle"
            value={storyTitle}
            placeholder="Title"
            onChange={handleTitleChange}
          ></textarea>
          <p className="saved-status">{savedStatus}</p>
        </div>
        <textarea
          name="storyContent"
          id="storyContent"
          placeholder="Once upon a time..."
          spellCheck="false"
          autoCapitalize="false"
          autoComplete="false"
          value={storyContent}
          onChange={handleContentChange}
        ></textarea>
        <div className="save-button-wrapper">
          <button>Save</button>
        </div>
      </form>
    </div>
  );
};

export default Writer;
