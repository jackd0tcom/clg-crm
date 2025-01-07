import WriterTitle from "../Elements/WriterTitle";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const NewStory = () => {
  const [storyTitle, setStoryTitle] = useState("");
  const [noTitle, setNoTitle] = useState(false);
  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    setStoryTitle(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storyTitle.trim()) {
      setNoTitle(true);
      return;
    }
    try {
      axios
        .post("/api/newStory", {
          storyContent: "",
          storyTitle,
        })
        .then((res) => {
          console.log("new story created");
          navigate(`/write/${res.data.storyId}`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const warning = () => {
    !noTitle ? <p>Please give it some kind of placeholder for now</p> : <></>;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="new-story-wrapper">
        <h2>Give it a title.</h2>
        <WriterTitle
          handleTitleChange={handleTitleChange}
          storyTitle={storyTitle}
        />
        <button>Create Story</button>
        {warning}
      </form>
    </>
  );
};

export default NewStory;
