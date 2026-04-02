import { useState } from "react";
import ProfilePic from "../UI/ProfilePic";
import axios from "axios";

const PendingUserItem = ({ user, setPendingUsers }) => {
  const [hovering, setHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      await axios
        .post("/api/deletePendingUser", { email: user.email })
        .then((res) => {
          if (res.status === 200) {
            setPendingUsers((prev) =>
              prev.filter((u) => u.email !== user.email),
            );
            setIsDeleting(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return isDeleting ? (
    <div className="delete-user-wrapper">
      <h3>Are you sure you want to delete this user?</h3>
      <div className="delete-user-buttons">
        <button className="delete-button" onClick={() => handleDelete()}>
          Delete
        </button>
        <button className="cancel-button" onClick={() => setIsDeleting(false)}>
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div
      className="admin-user-toggle-wrapper"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <ProfilePic src={"/default-profile-pic.jpg"} />
      <p>Pending User</p>
      <p>{user.email}</p>
      <div className="role-container">
        <div className="role-toggle-wrapper">
          <span className={`role-badge pending`}>Pending</span>
        </div>
      </div>
      <p></p>
      {hovering && (
        <i
          onClick={() => setIsDeleting(true)}
          className="delete-user fa-solid fa-circle-xmark"
        ></i>
      )}
    </div>
  );
};
export default PendingUserItem;
