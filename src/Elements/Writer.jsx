import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Writer = () => {
  const [storyContent, SetStoryContent] = useState("");
  const [storyTitle, SetStoryTitle] = useState("");
  const [storyIdState, SetStoryIdState] = useState(0);
  const { storyId } = useParams;

  useEffect(() => {
    async function fetchStory() {
      try {
        if (storyId) {
          console.log(storyId);
          SetStoryIdState(storyId);
          axios.get("/api/getStory", { storyId }).then((res) => {
            SetStoryContent(res.data.storyContent);
            SetStoryTitle(res.data.storyTitle);
            SetStoryIdState(res.data.storyId);
          });
        }
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
          <input
            type="text"
            name="storyTitle"
            id="storyTitle"
            value={storyTitle}
            onChange={(e) => SetStoryTitle(e.target.value)}
          />
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
