import axios from "axios";
import { useState, useEffect } from "react";
import FriendStoryCard from "./FriendStoryCard";

const TopStories = () => {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get("/api/getTopStories");
        setStories(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    getData();
  }, []);

  return (
    <div>
      <h2>Top Stories</h2>
      {stories.map((story) => {
        let array = story.content.split(" ");
        let excerpt =
          array.length > 14
            ? array.slice(0, 14).join(" ") + "..."
            : array.join(" ") + "...";
        return (
          <FriendStoryCard
            excerpt={excerpt}
            id={story.userId}
            title={story.title}
            updatedAt={story.updatedAt}
          />
        );
      })}
    </div>
  );
};

export default TopStories;
