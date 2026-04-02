import { useState } from "react";
import ProfilePic from "../UI/ProfilePic";
import axios from "axios";

const AdminUserToggle = ({
  user,
  handleAllow,
  handleRoleChange,
  setUsers,
  users,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await handleAllow(user);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async () => {
    setRoleLoading(true);
    try {
      await handleRoleChange(user);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios
        .post("/api/deleteUser", { userId: user.userId })
        .then((res) => {
          if (res.status === 200) {
            setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
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
      <ProfilePic
        src={user.profilePic}
        alt="user profile picture"
        size="medium"
        className="admin-user-profile-pic"
      />
      <p>
        {user.fullName ||
          `${user.firstName} ${user.lastName}`.trim() ||
          user.username}
      </p>
      <p>{user.email}</p>
      <div className="role-container">
        <div className="role-toggle-wrapper">
          <span className={`role-badge ${user.role}`}>{user.role}</span>
          <button
            onClick={handleRoleToggle}
            disabled={roleLoading}
            className="role-toggle-button"
            title={`Change to ${user.role === "admin" ? "user" : "admin"}`}
          >
            {roleLoading
              ? "..."
              : user.role === "admin"
                ? "Switch to User"
                : "Switch to Admin"}
          </button>
        </div>
      </div>
      <div className="toggle-container">
        <p>Blocked</p>
        <label htmlFor={`allow-toggle-${user.userId}`} className="switch">
          <input
            type="checkbox"
            onChange={handleToggle}
            name={`allow-toggle-${user.userId}`}
            id={`allow-toggle-${user.userId}`}
            checked={user.isAllowed}
            disabled={isLoading}
          />
          <span className="slider round"></span>
        </label>
        <p>Allowed</p>
      </div>
      {hovering && (
        <i
          onClick={() => setIsDeleting(true)}
          className="delete-user fa-solid fa-circle-xmark"
        ></i>
      )}
    </div>
  );
};
export default AdminUserToggle;
