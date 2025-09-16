import { User, Case } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";
import {
  Task,
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

export default {
  // Get all activities where the current user is a reader
  getNotifications: async (req, res) => {
    console.log("getNotifications");
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;

      const notifications = await Notification.findAll({ where: { userId } });

      res.json(notifications);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching activities");
    }
  },
};
