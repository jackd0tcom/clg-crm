import { Comment } from "../model.js";
import { Op } from "sequelize";
import { notifyCommentCreated } from "../helpers/notificationHelper.js";
import { getIO } from "../socketServer.js";

export default {
  createComment: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { objectType, objectId, content } = req.body;
      const { userId } = req.session.user;

      const newComment = await Comment.create({
        objectType,
        objectId,
        content,
        authorId: userId,
      });

      const notification = await notifyCommentCreated({
        object: content,
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
};
