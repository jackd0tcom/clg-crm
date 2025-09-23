import { useState } from "react";

const AdminUserToggle = ({ user, handleAllow, handleRoleChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

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

  return (
    <div className="admin-user-toggle-wrapper">
      <img
        src={user.profilePic || "/src/assets/default-profile-pic.jpg"}
        alt="user profile picture"
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
            {roleLoading ? "..." : "↔"}
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
    </div>
  );
};
export default AdminUserToggle;
