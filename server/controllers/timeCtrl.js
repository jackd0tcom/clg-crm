import { Case, User, Person, Task, TimeEntry } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
  spaceOut,
} from "../helpers/activityHelper.js";
import { Op } from "sequelize";

const now = () => {
  return Date.now();
};

export default {
  startEntry: async (req, res) => {
    try {
      // Create new entry with the user and task / caseId and server NOW
      // Mark entry isRunning as true
      // Return timeEntryId and startTime
      console.log("startEntry");
      const { caseId, taskId, notes, userId } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const newEntry = await TimeEntry.create({
        caseId,
        taskId,
        userId: userId ? userId : req.session.user.userId,
        notes,
        startTime: now(),
        isRunning: true,
      });

      res.status(200).send(newEntry);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  stopEntry: async (req, res) => {
    try {
      // Stop entry
      // Mark entry isRunning as false
      console.log("stopEntry");
      const { timeEntryId } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentEntry = await TimeEntry.findOne({ where: { timeEntryId } });

      if (!currentEntry) {
        res.status(401).send("Entry does not exist");
        return;
      }

      const updatedEntry = await currentEntry.update({
        endTime: now(),
        isRunning: false,
      });

      res.status(200).send(updatedEntry);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  updateEntry: async (req, res) => {
    try {
      console.log("updateEntry");
      const { timeEntryId, notes, caseId, taskId, startTime, endTime, userId } =
        req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentEntry = await TimeEntry.findOne({ where: { timeEntryId } });

      if (!currentEntry) {
        res.status(401).send("Entry does not exist");
        return;
      }

      const updatedEntry = await currentEntry.update({
        notes,
        caseId,
        taskId,
        startTime,
        endTime,
        userId: userId ? userId : req.session.user.userId,
      });

      res.status(200).send(updatedEntry);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  deleteEntry: async (req, res) => {
    try {
      console.log("deleteEntry");
      const { timeEntryId } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentEntry = await TimeEntry.findOne({ where: { timeEntryId } });

      if (!currentEntry) {
        res.status(401).send("Entry does not exist");
        return;
      }

      await currentEntry.destroy();

      res.status(200).send("Entry deleted successfully");
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  newEntry: async (req, res) => {
    try {
      console.log("newEntry");
      const { caseId, taskId, notes, userId, startTime, endTime } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const newEntry = await TimeEntry.create({
        caseId,
        taskId,
        userId: userId ? userId : req.session.user.userId,
        notes,
        startTime,
        endTime,
        isRunning: false,
      });

      res.status(200).send(newEntry);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  runningTimer: async (req, res) => {
    try {
      // Check for active entries
      // Return if there is one
      console.log("runningTimer");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const activeEntry = await TimeEntry.findOne({
        where: { isRunning: true, userId: req.session.user.userId },
      });

      if (!activeEntry) {
        res.status(200).send("No active entries");
        return;
      }

      let currentProject;

      if (activeEntry.caseId) {
        currentProject = await Case.findOne({
          where: { caseId: activeEntry.caseId },
        });
      }
      if (activeEntry.taskId) {
        currentProject = await Task.findOne({
          where: { taskId: activeEntry.taskId },
        });
      }

      const payload = {
        ...activeEntry.toJSON(),
        case: currentProject?.toJSON?.(),
      };

      res.status(200).send(payload);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  getUserEntries: async (req, res) => {
    try {
      // Get all entries for user
      console.log("getUserEntries");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const entries = await TimeEntry.findAll({
        where: { userId: req.session.user.userId, endTime: { [Op.not]: null } },
        order: [
          ["endTime", "DESC"],
          ["timeEntryId", "DESC"],
        ],
      });

      const notNullEntries = entries.filter((entry) => entry !== null);

      const entriesWithProjects = await Promise.all(
        notNullEntries.map(async (entry) => {
          const entryJson = entry.toJSON();

          if (entry.caseId) {
            const caseObject = await Case.findOne({
              where: { caseId: entry.caseId },
            });
            return {
              ...entryJson,
              projectTitle: caseObject.title,
            };
          }

          if (entry.taskId) {
            const taskObject = await Task.findOne({
              where: { taskId: entry.taskId },
            });
            return {
              ...entryJson,
              projectTitle: taskObject.title,
              status: taskObject.status,
            };
          }
        }),
      );

      if (!entries) {
        res.status(200).send("No Entries Found");
      } else res.status(200).send(entriesWithProjects);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  getRecentUserEntries: async (req, res) => {
    try {
      // Get all entries for user that are within this week maybe? or just maybe the last 5?
      console.log("getRecentUserEntries");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const entries = await TimeEntry.findAll({
        where: { userId: req.session.user.userId, endTime: { [Op.not]: null } },
        limit: 12,
        order: [
          ["endTime", "DESC"],
          ["timeEntryId", "DESC"],
        ],
      });

      const notNullEntries = entries.filter((entry) => entry !== null);

      const entriesWithProjects = await Promise.all(
        notNullEntries.map(async (entry) => {
          const entryJson = entry.toJSON();

          if (entry.caseId) {
            const caseObject = await Case.findOne({
              where: { caseId: entry.caseId },
            });
            return {
              ...entryJson,
              projectTitle: caseObject.title,
            };
          }

          if (entry.taskId) {
            const taskObject = await Task.findOne({
              where: { taskId: entry.taskId },
            });
            return {
              ...entryJson,
              projectTitle: taskObject.title,
              status: taskObject.status,
            };
          }
        }),
      );

      if (!entries) {
        res.status(200).send("No Entries Found");
      } else res.status(200).send(entriesWithProjects);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
};
