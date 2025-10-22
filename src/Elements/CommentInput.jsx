import axios from "axios";
import { useState, useEffect } from "react";

const CommentInput = ({ objectType, objectId, refreshActivityData }) => {
  const [comment, setComment] = useState("");

  const createComment = async () => {
    try {
      const res = await axios.post("/api/createComment", {
        objectType,
        objectId,
        content: comment,
      });
      setComment("");
      refreshActivityData();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="comment-input-wrapper
  "
    >
      <input
        onChange={(e) => {
          setComment(e.target.value);
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
