import {
  ActivityLog,
  User,
  ActivityReaders,
  Person,
  Comment,
} from "../model.js";
import { Op } from "sequelize";

export default {
  // Get all activities where the current user is a reader
  getUserActivities: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;

      const activities = await ActivityLog.findAll({
        include: [
          {
            model: User,
            as: "author",
            attributes: ["userId", "username", "firstName", "lastName"],
          },
          {
            model: User,
            as: "readers",
            where: { userId }, // Only get activities where current user is a reader
            through: { attributes: ["isRead"] },
            attributes: ["userId", "username", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 50, // Limit to recent activities
      });

      res.json(activities);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching activities");
    }
  },

  // Get activities for a specific case
  getCaseActivities: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId } = req.params;
      const { userId } = req.session.user;

      // Get person IDs for this case
      const people = await Person.findAll({
        where: { caseId },
        attributes: ["personId"],
      });
      const personIds = people.map((p) => p.personId);

      // Get all activities for the case (including person activities)
      const activities = await ActivityLog.findAll({
        where: {
          [Op.or]: [
            {
              objectType: "case",
              objectId: caseId,
            },
            {
              objectType: "person",
              objectId: {
                [Op.in]: personIds,
              },
            },
          ],
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: [
              "userId",
              "username",
              "firstName",
              "lastName",
              "profilePic",
            ],
          },
          {
            model: User,
            as: "readers",
            attributes: [
              "userId",
              "username",
              "firstName",
              "lastName",
              "profilePic",
            ],
            required: false,
          },
        ],
      });

      // Get all comments for this case
      const comments = await Comment.findAll({
        where: {
          objectType: "case",
          objectId: caseId,
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: [
              "userId",
              "username",
              "firstName",
              "lastName",
              "profilePic",
            ],
          },
        ],
      });

      // Add a type discriminator to each item
      const activitiesWithType = activities.map((a) => ({
        ...a.toJSON(),
        itemType: "activity",
      }));

      const commentsWithType = comments.map((c) => ({
        ...c.toJSON(),
        itemType: "comment",
      }));

      // Merge and sort by createdAt descending
      const combinedFeed = [...activitiesWithType, ...commentsWithType].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      res.status(200).json(combinedFeed);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching case activities");
    }
  },
  getTaskActivities: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { taskId } = req.params;
      const { userId } = req.session.user;

      // Get all activities for the case (including person activities)
      const activities = await ActivityLog.findAll({
        where: {
          objectType: "task",
          objectId: taskId,
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: [
              "userId",
              "username",
              "firstName",
              "lastName",
              "profilePic",
            ],
          },
          {
            model: User,
            as: "readers",
            attributes: [
              "userId",
              "username",
              "firstName",
              "lastName",
              "profilePic",
            ],
            required: false, // This makes it a LEFT JOIN
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(activities);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching case activities");
    }
  },

  // Create a new activity and assign readers
  createActivity: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { authorId, objectType, objectId, action, details, readerIds } =
        req.body;

      // Create the activity
      const activity = await ActivityLog.create({
        authorId: authorId || req.session.user.userId,
        objectType,
        objectId,
        action,
        details,
      });

      // If reader IDs are provided, create the reader relationships
      if (readerIds && readerIds.length > 0) {
        const readerRecords = readerIds.map((userId) => ({
          activityId: activity.activityId,
          userId,
        }));

        await ActivityReaders.bulkCreate(readerRecords);
      }

      res.status(201).json(activity);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error creating activity");
    }
  },

  // Mark an activity as read for the current user
  markAsRead: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { activityId } = req.body;
      const { userId } = req.session.user;

      await ActivityReaders.update(
        { isRead: true },
        {
          where: {
            activityId,
            userId,
          },
        }
      );

      res.json({ message: "Activity marked as read" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error marking activity as read");
    }
  },
};
