import { Comment } from "../model.js";
import { Op } from "sequelize";
import { notifyCommentCreated } from "../helpers/notificationHelper.js";

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
        object: newComment.dataValues,
        actorId: userId,
        actorName: req.session.user.firstName + " " + req.session.user.lastName,
      });

      res.status(200).send(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Error creating comment");
    }
  },
};
