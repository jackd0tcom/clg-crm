import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import StoryCard from "./StoryCard";

const StoriesList = () => {
  const [stories, setStories] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(true);
  const userId = useSelector((state) => state.userId);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState(null);
  const [friendStories, setFriendStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }

    async function fetchData() {
      try {
        const [storiesResponse, friendsResponse] = await Promise.all([
          axios.get("/api/getAllStories"),
          axios.get("/api/getFriendStories"),
        ]);
        setStories(storiesResponse.data);
        setFriendStories(friendsResponse.data);
        console.log(storiesResponse.data, friendsResponse.data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    }
    fetchData();
  }, [userId, navigate]);

  const handleDelete = (id) => {
    console.log(id);
    try {
      axios.delete(`/api/deleteStory/${id}`).then((res) => {
        setStories(res.data);
        setIsConfirmed(true);
        setDeleteId(null);
        setDeleteTitle(null);
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!isConfirmed) {
    return (
      <>
        <h2>Are you sure you want to delete {deleteTitle}?</h2>
        <button
          onClick={() => {
            handleDelete(deleteId);
          }}
        >
          Delete it
        </button>
        <button onClick={() => setIsConfirmed(true)}>Cancel</button>
      </>
    );
  }

  return (
    <>
      <h1>My Stories</h1>
      <div className="stories-list-container">
        <div className="stories-list-wrapper">
          {stories.length > 0 ? (
            stories.map((story, index) => {
              let array = story.content.split(" ");
              let excerpt = "";
              if (array.length > 14) {
                excerpt = array.splice(0, 14).join(" ") + "...";
              } else excerpt = array.join(" ") + "...";
              return (
                <StoryCard
                  id={story.storyId}
                  title={story.storyTitle}
                  excerpt={excerpt}
                  updatedAt={story.updatedAt}
                  setDeleteId={setDeleteId}
                  setDeleteTitle={setDeleteTitle}
                  setIsConfirmed={setIsConfirmed}
                />
              );
            })
          ) : (
            <button
              onClick={() => {
                navigate("/new-story");
              }}
            >
              Start your first story
            </button>
          )}
          {friendStories.map((friend) => {
            console.log(friend);
            friend.stories.forEach((story) => {
              return <h1>yup</h1>;
            });
          })}
        </div>
      </div>
    </>
  );
};

export default StoriesList;
