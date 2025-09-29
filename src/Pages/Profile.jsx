import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../Elements/LogoutButton";
import { useSelector } from "react-redux";
import ProfilePic from "../Elements/ProfilePic";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const userStore = useSelector((state) => state.user);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div className="profile-page-wrapper">
        <div className="profile-header">
          <h1 className="section-heading">Profile</h1>
        </div>
        <div className="profile-body">
          <div className="user-info">
            <ProfilePic src={user.picture} alt={user.name} size="large" />
            {userStore.isAdmin && <p className="profile-admin-badge">Admin</p>}
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  );
};

export default Profile;
