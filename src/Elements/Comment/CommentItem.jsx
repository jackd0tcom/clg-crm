import { formatRelativeTime } from "../../helpers/helperFunctions";

const CommentItem = ({ data }) => {
  return (
    <div className="comment-item-wrapper">
      <div className="comment-item-header">
        <div className="comment-item-header-user">
          <img src={data.author.profilePic} alt="" id="comment-profile-pic" />
          <p>{data.author.firstName + " " + data.author.lastName}</p>
        </div>
        <p className="comment-item-date">
          {formatRelativeTime(data.createdAt)}
        </p>
      </div>
      <div className="comment-item-comment">
        <p>{data.content}</p>
      </div>
    </div>
  );
};
export default CommentItem;
