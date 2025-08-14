import { useSelector } from "react-redux";

const ProfilePic = ({ user }) => {
  const userProfilePic = useSelector((state) => state.user.profilePic);
  return (
    <div className="profile-pic-wrapper">
      <img src={!user ? userProfilePic : user.profilePic} alt="" />
    </div>
  );
};

export default ProfilePic;
