import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../Elements/Loader";
import { useParams } from "react-router-dom";

const Profile = () => {
  const currentUserId = useSelector((state) => state.userId);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { userIdParams } = useParams();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userId = userIdParams || currentUserId;
    try {
      axios.get(`/api/getUser/${userId}`).then((res) => {
        setUserData(res.data);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 250);
    }
  }, [userId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="profile-wrapper">
      <button
        onClick={() => {
          console.log(userData);
        }}
      >
        User Data
      </button>
      <div className="profile-title-wrapper">
        <div className="profile-pic"></div>
        <h2>{userData.username}</h2>
      </div>
      <div className="profile-content-wrapper">
        <p>
          {userData.firstName} {userData.lastName}
        </p>
      </div>
      <div className="profile-friends-wrapper">
        <h2>Friends</h2>
        {userData.friends.map((friend) => {
          return (
            <div key={friend.userId} className="profile-friend-card">
              <h4>{friend.username}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
