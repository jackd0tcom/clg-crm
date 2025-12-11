import axios from "axios";
import { useState, useEffect } from "react";

const CommentInput = ({ objectType, objectId, refreshActivityData }) => {
  const [comment, setComment] = useState();

  const createComment = async () => {
    if (comment !== " ") {
      try {
        const res = await axios.post("/api/createComment", {
          objectType,
          objectId,
          content: comment,
        });
        setComment("");
        refreshActivityData();
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div
      className="comment-input-wrapper
  "
    >
      <textarea
        spellCheck={true}
        onChange={(e) => {
          setComment(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            createComment();
          }
        }}
        value={comment}
        type="text"
        name="comment-input"
        id="comment-input"
        placeholder="Add an activity, comment, etc.."
      />
      <i
        onClick={() => createComment()}
        id="comment-enter-icon"
        className="fa-solid fa-paper-plane"
      ></i>
    </div>
  );
};
export default CommentInput;
