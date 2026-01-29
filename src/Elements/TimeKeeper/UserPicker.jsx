import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ProfilePic from "../UI/ProfilePic";
import axios from "axios";

const UserPicker = ({ userId, entry, setEntry }) => {
  const [userList, setUserList] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        await axios.get("/api/getUsers").then((res) => {
          if (res.statusText === "OK") {
            setUserList(res.data);
            setCurrentUser(res.data.filter((user) => user.userId === userId));
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".user-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowUserPicker(false);
      }
    };

    if (showUserPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserPicker]);

  const handleUserSelect = (user) => {
    setCurrentUser(user);
    setEntry({ ...entry, userId: user.userId });
  };

  return (
    <div className="user-picker">
      <button onClick={setShowUserPicker} className="user-picker-button">
        <ProfilePic src={currentUser.profilePic} />
      </button>
      {showUserPicker && (
        <div className="user-picker-wrapper" ref={dropdownRef}>
          <div className="user-picker-container">
            {userList?.map((user) => (
              <div
                className="user-picker-item"
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-picker-first">
                  <ProfilePic src={user.profilePic} />
                  <p>
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                {currentUser.userId === user.userId && (
                  <i className="fa-solid fa-check"></i>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default UserPicker;
