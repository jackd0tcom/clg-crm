import axios from "axios";
import { useState, useEffect } from "react";
import FriendStoryCard from "./FriendStoryCard";
import { useSelector } from "react-redux";

const FriendStoryList = () => {
  const [storyList, setStoryList] = useState([]);
  const userId = useSelector((state) => state.userId);

  useEffect(() => {
    async function fetchData() {
      try {
        const [storiesResponse] = await Promise.all([
          axios.get("/api/getFriendStories"),
        ]);
        setStoryList(storiesResponse.data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    }
    fetchData();
  }, [userId]);

  return storyList.map((friend) => {
    return (
      <div key={friend.friend.friendId} className="friend-stories">
        <div className="stories-container">
          {friend.stories.map((story) => {
            let array = story.content.split(" ");
            let excerpt =
              array.length > 14
                ? array.slice(0, 14).join(" ") + "..."
                : array.join(" ") + "...";
            return (
              <FriendStoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                excerpt={excerpt}
                updatedAt={story.updatedAt}
                userId={userId}
                likes={story.likes}
                username={story.username}
              />
            );
          })}
        </div>
      </div>
    );
  });
};

export default FriendStoryList;
