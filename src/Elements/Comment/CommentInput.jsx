import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";
import Mentioner from "../UI/Mentioner";

const CommentInput = ({
  objectType,
  objectId,
  refreshActivityData,
  mentionData,
}) => {
  const [comment, setComment] = useState();
  const [showTagger, setShowTagger] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [currentMention, setCurrentMention] = useState(null);
  const textAreaRef = useRef();
  const [cursorPos, setCursorPos] = useState(0);

  const createMention = () => {
    console.log(currentMention);

    let type = "user";
    if (currentMention.caseId) {
      type = "case";
    } else if (currentMention.taskId) {
      type = "task";
    }

    let id;

    if (type === "user") {
      id = currentMention.userId ?? null;
    } else if (type === "case") {
      id = currentMention.caseId ?? null;
    } else id = currentMention.taskId ?? null;

    let name;
    if (type === "user") {
      name = `${currentMention.firstName}` ?? null;
    } else name = `${currentMention.title}` ?? null;

    let profilePic = null;

    if (type === "user") {
      profilePic = currentMention.profilePic;
    }

    const commentWords = comment.split(" ");

    const root = commentWords.findIndex((word) => word === `@${query}`);

    const queryWords = query.split(" ");

    const mention = `$:MENTION:${type}:${id}:${name}:${profilePic}`;

    commentWords[root] = mention;

    const newComment = commentWords.join(" ");
    setComment(newComment);
    setShowTagger(false);
    return;
  };

  let query = "";
  if (comment?.includes("@")) {
    const ampersand = comment.indexOf("@");
    query = comment.slice(ampersand + 1).toLowerCase();
  }

  const filteredData = useMemo(() => {
    if (!mentionData) return [];
    const allData = { ...mentionData };
    const users = allData.users ?? [];
    const tasks = allData.tasks ?? [];
    const cases = allData.cases ?? [];

    if (query.trim() === "") {
      return [...users, ...tasks, ...cases];
    }

    const filteredCases = cases.filter((cas) =>
      cas.title?.toLowerCase().includes(query),
    );

    const filteredTasks = tasks.filter((task) =>
      task.title?.toLowerCase().includes(query),
    );

    const filteredUsers = users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query),
    );

    const data = [...filteredUsers, ...filteredTasks, ...filteredCases];

    setCurrentMention(data[mentionIndex]);

    return data;
  }, [query, mentionData]);

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

  const handleMentionerScroll = (down) => {
    let currentIndex = mentionIndex;
    if (down) {
      if (currentIndex >= 1) {
        if (currentIndex < filteredData?.length - 1) currentIndex += 1;
      } else currentIndex += 1;
      setMentionIndex(currentIndex);
      setCurrentMention(filteredData[currentIndex]);
    } else {
      if (currentIndex > 0) {
        currentIndex -= 1;
      } else currentIndex = 0;
      setMentionIndex(currentIndex);
      setCurrentMention(filteredData[currentIndex]);
      setMentionIndex(currentIndex);
      setCurrentMention(filteredData[mentionIndex]);
    }
  };

  const handleCursorMovement = (e) => {
    setCursorPos(e.target.selectionStart);
  };

  return (
    <div
      className="comment-input-wrapper
  "
    >
      <textarea
        ref={textAreaRef}
        spellCheck={true}
        onChange={(e) => {
          setComment(e.target.value);
          setCursorPos(e.target.selectionStart);
        }}
        onKeyUp={handleCursorMovement}
        onClick={handleCursorMovement}
        onKeyDown={(e) => {
          if (showTagger) {
            if (e.key === "Enter") {
              e.preventDefault();
              createMention();
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              handleMentionerScroll(true);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              handleMentionerScroll(false);
            } else setMentionIndex(0);
          } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            createComment();
          } else if (e.key === "@") {
            setShowTagger(true);
          }
        }}
        value={comment}
        type="text"
        name="comment-input"
        id="comment-input"
        placeholder="Add an activity, comment, etc.."
      />
      {showTagger && (
        <Mentioner
          filteredData={filteredData}
          comment={comment}
          mentionData={mentionData}
          mentionIndex={mentionIndex}
          setMentionIndex={mentionIndex}
          query={query}
        />
      )}
      <i
        onClick={() => createComment()}
        id="comment-enter-icon"
        className="fa-solid fa-paper-plane"
      ></i>
    </div>
  );
};
export default CommentInput;
