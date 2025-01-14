import { useState, useEffect } from "react";
import axios from "axios";
import { parseISO, max } from "date-fns";
import FriendStoryCard from "./FriendStoryCard";

const LastStory = ({ userId }) => {
  const [storyList, setStoryList] = useState([]);
  const [dates, setDates] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await axios.get("/api/getAllStories");
        setStoryList(res.data);

        const extractedDates = res.data.map((story) =>
          parseISO(story.updatedAt)
        );
        setDates(extractedDates);
      } catch (error) {
        console.log("Error fetching stories:", error);
      }
    }
    fetchStories();
  }, []);

  useEffect(() => {
    if (dates.length > 0) {
      const latestDate = max(dates);
      const latestStory = storyList.find(
        (story) => parseISO(story.updatedAt).getTime() === latestDate.getTime()
      );
      setLatest(latestStory || null);
    }
  }, [dates, storyList]);

  return (
    <div className="latest-story-container">
      <h2>Pick up where you left off...</h2>
      {latest && (
        <FriendStoryCard
          id={latest.id}
          title={latest.title}
          excerpt={latest.content}
          updatedAt={latest.updatedAt}
          userId={userId}
        />
      )}
    </div>
  );
};

export default LastStory;
