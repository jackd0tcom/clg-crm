import { useState } from "react";

const AdminUserToggle = ({ user, handleAllow }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await handleAllow(user);
    } finally {
      setIsLoading(false);
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
        {user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.username}
      </p>
      <p>{user.email}</p>
      <p className={`role-badge ${user.role}`}>
        {user.role}
      </p>
      <div className="toggle-container">
        <label
          htmlFor={`allow-toggle-${user.userId}`}
          className="switch"
        >
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
        {isLoading && <span className="loading-text">Updating...</span>}
      </div>
    </div>
  );
};
export default AdminUserToggle;
