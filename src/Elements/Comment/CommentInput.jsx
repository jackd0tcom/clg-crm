import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";
import Mentioner from "../UI/Mentioner";
import { camelCase } from "../../helpers/helperFunctions";

const CommentInput = ({
  objectType,
  objectId,
  refreshActivityData,
  mentionData,
  openTaskView,
}) => {
  const [comment, setComment] = useState();
  const [showTagger, setShowTagger] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [currentMention, setCurrentMention] = useState(null);
  const textAreaRef = useRef();
  const [cursorPos, setCursorPos] = useState(0);
  const [mentions, setMentions] = useState([]);
  const [query, setQuery] = useState("");

  const createMention = () => {
    console.log(currentMention);
    let type = "user";
    if (currentMention.caseId) {
      type = "case";
    }
    if (currentMention.taskId) {
      type = "task";
    }

    console.log(type);

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

    let extra = null;

    if (type === "user") {
      extra = currentMention.profilePic;
    } else if (type === "task") extra = camelCase(currentMention.status);

    const commentWords = comment.split(" ");

    const newQuery = `@${query.toLowerCase()}`;

    const root = commentWords.findIndex(
      (word) => word.toLowerCase() === `@${query}`,
    );

    const mention = `$:MENTION:${type}:${id}:${name}:${extra}`;

    commentWords[root] = `@${name}`;

    setMentions((prev) => [...prev, { key: `@${name}`, mention: mention }]);

    const newComment = commentWords.join(" ") + " ";

    setComment(newComment);
    setQuery("");
    setShowTagger(false);
    return;
  };

  let filteredString = "";

  const cueQuery = (string) => {
    let words = string.split(" ");
    for (const mention of mentions) {
      const mentionWords = mention.key.split(" ");
      const idx = words.findIndex(
        (w) => w.toLowerCase() === mentionWords.join("").toLowerCase(),
      );
      if (idx !== -1) {
        words.splice(idx, mentionWords.length, "");
      }
    }
    filteredString = words.join(" ").replace(/\s+/g, " ").trim();
    if (filteredString?.includes("@")) {
      const ampersand = filteredString.indexOf("@");
      setQuery(filteredString.slice(ampersand + 1).toLowerCase());
    } else setShowTagger(false);
  };

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
    if (!comment || comment === " " || comment.length <= 0) return;

    console.log(mentions);
    console.log(comment);

    const newQuery = `@${query}`;

    // let words = comment.split(" ");
    let newComment = comment;
    for (const mention of mentions) {
      newComment = newComment.replace(mention.key, mention.mention);
      // const mentionWords = mention.key.split(" ");
      // const idx = words.findIndex(
      //   (w) => w.toLowerCase() === mentionWords.join(" ").toLowerCase(),
      // );
      // console.log(idx);
      // if (idx !== -1) {
      //   words.splice(idx, mentionWords.length, mention.mention);
      // }
    }
    // const newComment = words.join(" ").replace(/\s+/g, " ").trim();

    try {
      const res = await axios.post("/api/createComment", {
        objectType,
        objectId,
        content: newComment,
      });
      setComment("");
      refreshActivityData();
      setMentions([]);
    } catch (error) {
      console.log(error);
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

  // console.log(showTagger);

  return (
    <div
      className="comment-input-wrapper
  "
    >
      <textarea
        ref={textAreaRef}
        spellCheck={true}
        onChange={(e) => {
          cueQuery(e.target.value);
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
          openTaskView={openTaskView}
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
