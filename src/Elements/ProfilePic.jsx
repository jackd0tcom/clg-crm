import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";

const ProfilePic = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  return (
    <div className="profile-pic-wrapper">
      {isAuthenticated && <img src={user.picture} alt="" />}
    </div>
  );
};

export default ProfilePic;
