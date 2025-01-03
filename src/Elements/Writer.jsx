import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Writer = () => {
  const [storyContent, SetStoryContent] = useState("");
  const [storyTitle, SetStoryTitle] = useState("");
  const [storyIdState, SetStoryIdState] = useState(0);
  const { storyId } = useParams();
  const userId = useSelector((state) => state.userId);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStory() {
      try {
        if (userId) {
          if (storyId) {
            await axios.post("/api/getStory", { storyId }).then((res) => {
              if (res.data.userId === userId) {
                SetStoryContent(res.data.content);
                SetStoryTitle(res.data.title);
                SetStoryIdState(res.data.storyId);
              } else navigate("/restricted");
            });
          }
        } else navigate("/login");
      } catch (error) {
        console.log(error);
      }
    }
    fetchStory();
  }, [storyId]);

  const save = (e) => {
    e.preventDefault();
    if (storyIdState !== 0) {
      axios.post("/api/saveStory", {
        storyContent,
        storyTitle,
        storyId: storyIdState,
      });
    } else {
      axios.post("/api/newStory", { storyContent, storyTitle }).then((res) => {
        SetStoryIdState(res.data.storyId);
      });
    }
  };

  return (
    <>
      <div>
        <button
          onClick={() => {
            console.log(storyIdState);
          }}
        >
          Story Id
        </button>
        <form className="writer-wrapper" onSubmit={(e) => save(e)}>
          <textarea
            className="story-title"
            name="storyTitle"
            id="storyTitle"
            value={storyTitle}
            placeholder="Title"
            onChange={(e) => SetStoryTitle(e.target.value)}
          ></textarea>
          <textarea
            name=""
            id=""
            placeholder="Once upon a time..."
            spellCheck="false"
            autoCapitalize="false"
            autoComplete="false"
            value={storyContent}
            onChange={(e) => SetStoryContent(e.target.value)}
          ></textarea>
          <div className="save-button-wrapper">
            <button>Save</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Writer;
