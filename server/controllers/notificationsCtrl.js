import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";
import {
  Task,
  User,
  Person,
  PracticeArea,
  CasePracticeAreas,
  Notification,
} from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
} from "../helpers/activityHelper.js";
import {
  markNotificationAsRead,
  getUnreadNotificationCount,
} from "../helpers/notificationHelper.js";

export default {
  // Get all notifications for the current user
  getNotifications: async (req, res) => {
    console.log("getNotifications");
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;

      const notifications = await Notification.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Task,
            as: "task",
            attributes: [
              "taskId",
              "title",
              "status",
              "priority",
              "dueDate",
              "notes",
              "ownerId",
            ],
            required: false,
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["userId", "username", "firstName", "lastName"],
              },
            ],
          },
        ],
      });

      // Filter notifications to only include task notifications with valid task data
      const filteredNotifications = notifications.filter(
        (notification) =>
          notification.objectType === "task" && notification.task
      );

      res.json(filteredNotifications);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching notifications");
    }
  },

  // Mark a notification as read
  markAsRead: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { notificationId } = req.body;
      const { userId } = req.session.user;

      await markNotificationAsRead(notificationId, userId);

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).send("Error updating notification");
    }
  },

  // Get unread notification count for the current user
  getUnreadCount: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;
      const count = await getUnreadNotificationCount(userId);

      res.json({ unreadCount: count });
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      res.status(500).send("Error fetching notification count");
    }
  },

  // Mark all notifications as read for the current user
  markAllAsRead: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;

      await Notification.update(
        { isRead: true },
        {
          where: {
            userId,
            isRead: false,
          },
        }
      );

      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).send("Error updating notifications");
    }
  },
};
