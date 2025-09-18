import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../Elements/LogoutButton";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

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
            <img src={user.picture} alt={user.name} />
            <div className="user-data">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    )
  );
};

export default Profile;
