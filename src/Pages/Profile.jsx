import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../Elements/Loader";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const userId = useSelector((state) => state.user.userId);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
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

  const logout = () => {
    axios
      .delete("/api/logout")
      .then((res) => {
        dispatch({ type: "LOGOUT" });
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="profile-wrapper">
      <button
        onClick={() => {
          console.log(userData);
        }}
      >
        User Data
      </button>
      <div className="profile-content-wrapper">
        <p>
          {userData.firstName} {userData.lastName}
        </p>
      </div>
      <button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
