import { useNavigate } from "react-router";
import ProfilePic from "./ProfilePic";
import StatusIcon from "../Task/StatusIcon";
import { undoCamelCase } from "../../helpers/helperFunctions";

const MentionPill = ({ data, user, openTaskView }) => {
  const nav = useNavigate();
  return (
    <div
      className={
        data.type !== "user"
          ? "mention-pill-wrapper mention-hover"
          : "mention-pill-wrapper"
      }
      onClick={() => {
        if (data.type === "case") nav(`/case/${data.id}`);
        if (data.type === "task") openTaskView(data.id);
      }}
    >
      {data.type === "user" ? (
        <ProfilePic src={user.extra ?? null} />
      ) : data.type === "case" ? (
        <i className="fa-solid fa-briefcase"></i>
      ) : (
        <StatusIcon
          status={undoCamelCase(data.extra)}
          hasIcon={true}
          hasTitle={false}
          noBg={true}
        />
      )}

      {data.name ?? data.title ?? ""}
    </div>
  );
};
export default MentionPill;
