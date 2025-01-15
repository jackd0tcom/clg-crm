import { Link } from "react-router";
import { format } from "date-fns";

const StoryCard = ({
  excerpt,
  id,
  title,
  updatedAt,
  setDeleteId,
  setDeleteTitle,
  setIsConfirmed,
  userId,
  isPublished,
}) => {
  return (
    <div className="story-wrapper" key={id}>
      <Link className="story-container" to={`/write/${id}`}>
        <div key={id}>
          <h3 className="story-list-story-title">{title}</h3> <p>{excerpt}</p>
          <p className="updated-at">
            Last Updated: {format(new Date(updatedAt), "MMMM dd, yyyy h:mm a")}
          </p>
          {isPublished ? <p>Published</p> : <p>Private</p>}
        </div>
      </Link>
      <button
        onClick={() => {
          setDeleteId(id);
          setDeleteTitle(title);
          setIsConfirmed(false);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default StoryCard;
