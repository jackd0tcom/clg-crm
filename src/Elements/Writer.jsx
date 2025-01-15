import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";
import WriterBody from "./WriterBody";
import WriterTitle from "./WriterTitle";
import Restricted from "../Pages/Restricted";

const Writer = () => {
  const userId = useSelector((state) => state.userId);
  const [storyContent, SetStoryContent] = useState("");
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [storyTitle, SetStoryTitle] = useState("");
  const [savedStatus, setSavedStatus] = useState("Saved");
  const [changeCount, setChangeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const debounceTimer = useRef(null);
  const { storyId } = useParams();
  const [storyIdState, SetStoryIdState] = useState(storyId);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [publishedStatus, setPublishedStatus] = useState("");

  useEffect(() => {
    async function fetchStory() {
      try {
        await axios.post("/api/getStory", { storyId }).then((res) => {
          if (res.data.userId === userId) {
            console.log(res.data);
            allowedUsers.push(userId);
            SetStoryContent(res.data.content);
            SetStoryTitle(res.data.title);
            SetStoryIdState(res.data.storyId);
            setPublishedStatus(res.data.isPublished ? "Published" : "Private");
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 750);
      }
    }
    fetchStory();
  }, [userId]);

  useEffect(() => {
    if (changeCount >= 200) {
      autoSave();
      setChangeCount(0);
    }
    // const handleBeforeUnload = () => autoSave();
    // window.addEventListener("beforeunload", handleBeforeUnload);

    // return () => {
    //   window.removeEventListener("beforeunload", handleBeforeUnload);
    // };
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
    }, 8000);
  };

  const handleContentChange = (e) => {
    SetStoryContent(e.target.value);
    setChangeCount((prev) => prev + 1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      console.log("content change debounce autosave");
      autoSave();
    }, 8000);
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

  async function handlePublish() {
    try {
      setPublishedStatus("Publishing...");
      const res = await axios.post("/api/publishStory", {
        storyId: storyIdState,
      });
      if (res.status === 200) {
        setTimeout(() => {
          setPublishedStatus("Published");
        }, 500);
      }
    } catch (error) {
      console.log(error);
      setPublishedStatus("Error Publishing. Try again");
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  if (allowedUsers.includes(userId)) {
    return (
      <div>
        <form className="writer-wrapper" onSubmit={save}>
          <div className="story-title-wrapper">
            <p>{publishedStatus}</p>
            <WriterTitle
              storyTitle={storyTitle}
              handleTitleChange={handleTitleChange}
            />
            <p className="saved-status">{savedStatus}</p>
          </div>
          <WriterBody
            storyContent={storyContent}
            handleContentChange={handleContentChange}
          />
          <div className="save-button-wrapper">
            <button>Save</button>
          </div>
        </form>
        <button onClick={() => handlePublish()}>Publish</button>
      </div>
    );
  } else {
    return <Restricted />;
  }
};

export default Writer;
