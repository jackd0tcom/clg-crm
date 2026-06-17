import { Comment, Case, Task, User } from "../model.js";
import { Op } from "sequelize";
import {
  notifyCommentCreated,
  notifyTagging,
} from "../helpers/notificationHelper.js";
import { getIO } from "../socketServer.js";

export default {
  createComment: async (req, res) => {
    console.log("createComment");
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { objectType, objectId, content } = req.body;
      const { userId } = req.session.user;

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
        return parts.map((part) => {
          if (part && part.type === "user") {
            return part;
          }
        });
      }

      const newComment = await Comment.create({
        objectType,
        objectId,
        content,
        authorId: userId,
      });

      const mentions = renderCommentContent(content);

      if (mentions.length > 0) {
        mentions.forEach(async (mention) => {
          if (!mention || !mention.id) {
            return;
          } else
            await notifyTagging({
              object: newComment.dataValues,
              actorId: userId,
              actorName:
                req.session.user.firstName + " " + req.session.user.lastName,
              recipient: mention.id,
            });
        });
      }

      const notification = await notifyCommentCreated({
        object: newComment.dataValues,
        actorId: userId,
        actorName: req.session.user.firstName + " " + req.session.user.lastName,
      });

      // Emit socket.io event
      const io = getIO();
      io.to(`${objectType}:${objectId}`).emit(`comment:created`, {
        objectType,
        objectId: parseInt(objectId),
        field: "comment",
        value: content,
        updatedBy: req.session.user,
        timestamp: new Date().toISOString(),
      });

      res.status(200).send(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Error creating comment");
    }
  },
  getMentionData: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const { userId } = req.session.user;

      const cases = await Case.findAll({ where: { isArchived: false } });

      const tasks = await Task.findAll();

      const users = await User.findAll({
        where: {
          userId: {
            [Op.ne]: userId,
          },
        },
      });

      const payload = {
        cases: cases,
        tasks: tasks,
        users: users,
      };

      res.status(200).send(payload);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Error creating comment");
    }
  },
};
