import axios from "axios";
import { useState, useEffect } from "react";
import FriendStoryCard from "./FriendStoryCard";
import { useSelector } from "react-redux";

const TopStories = () => {
  const userId = useSelector((state) => state.userId);
  const [stories, setStories] = useState([]);
  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get("/api/getTopStories");
        const sortedStories = response.data.sort((a, b) => {
          return b.likes - a.likes;
        });
        setStories(sortedStories);
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
        if (story.likes < 1) {
          return;
        }
        return (
          <FriendStoryCard
            excerpt={excerpt}
            id={story.storyId}
            userId={story.userId}
            title={story.title}
            updatedAt={story.updatedAt}
            likes={story.likes}
            username={story.userId === userId ? "You" : story.author}
          />
        );
      })}
    </div>
  );
};

export default TopStories;
