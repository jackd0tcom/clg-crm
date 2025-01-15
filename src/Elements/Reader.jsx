import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import Loader from "./Loader";

const Reader = () => {
  const [storyData, setStoryData] = useState([]);
  const { storyId } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      await axios.post("/api/getStory", { storyId }).then((res) => {
        setStoryData(res.data);
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      });
    }
    fetch();
  }, []);

  function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="reader-wrapper">
      <div className="reader-title-wrapper">
        <textarea name="title" id="title" disabled>
          {storyData.title}
        </textarea>
      </div>
      <textarea className="reader-content" name="content" id="content" disabled>
        {storyData.content}
      </textarea>
    </div>
  );
};

export default Reader;
