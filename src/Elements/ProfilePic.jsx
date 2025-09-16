import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";

const ProfilePic = ({ user }) => {
  const { isAuthenticated } = useAuth0;
  const userProfilePic = useSelector((state) => state.user.profilePic);
  return (
    <div className="profile-pic-wrapper">
      {isAuthenticated && (
        <img src={!user ? userProfilePic : user.profilePic} alt="" />
      )}
      <img src="src/assets/default-profile-pic.jpg" alt="" />
    </div>
  );
};

export default ProfilePic;
