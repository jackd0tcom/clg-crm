import { formatRelativeTime } from "../../helpers/helperFunctions";
import MentionPill from "../UI/MentionPill";

const CommentItem = ({ data, openTaskView }) => {
  // Conceptual — split on mention pattern, map segments to text vs chip
  const MENTION_RE = /\$:MENTION:(\w+):([^:]*):([^:]*):(\S*)/g;

  function renderCommentContent(content) {
    const parts = [];
    let last = 0;
    let m;
    while ((m = MENTION_RE.exec(content)) !== null) {
      if (m.index > last)
        parts.push({ type: "text", value: content.slice(last, m.index) });
      parts.push({
        // type: "mention",
        type: m[1],
        id: m[2],
        name: m[3],
        extra: m[4],
      });
      last = m.index + m[0].length;
    }
    if (last < content?.length)
      parts.push({ type: "text", value: content.slice(last) });
    return parts.map((part) =>
      part.type === "text" ? (
        <span>{part.value}</span>
      ) : (
        <MentionPill
          data={part}
          user={data.author}
          openTaskView={openTaskView}
        />
      ),
    );
  }

  // console.log(renderCommentContent(data.content));

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
        {renderCommentContent(data.content).map((part) => part)}
      </div>
    </div>
  );
};
export default CommentItem;
