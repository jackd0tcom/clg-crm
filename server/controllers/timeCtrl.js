import { Case, User, Person, Task, TimeEntry } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
  spaceOut,
} from "../helpers/activityHelper.js";

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
      const { caseId, taskId, notes } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const newEntry = await TimeEntry.create({
        caseId,
        taskId,
        userId: req.session.user.userId,
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
  activeEntry: async (req, res) => {
    try {
      // Check for active entries
      // Return if there is one
      console.log("active");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const activeEntry = await TimeEntry.findOne({
        where: { isRunning: true, userId: req.session.user.userId },
      });

      if (!activeEntry) {
        res.status(200).send("No Active Entries");
      } else res.status(200).send(activeEntry);
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
        where: { userId: req.session.user.userId },
      });

      if (!entries) {
        res.status(200).send("No Entries Found");
      } else res.status(200).send(entries);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
};
