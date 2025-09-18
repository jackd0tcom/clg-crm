import { User, Case, Task } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees, TaskAssignees } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
  formatDateNoTime,
} from "../helpers/activityHelper.js";
import { syncTaskWithCalendar } from "../helpers/calendarSyncHelper.js";
import {
  notifyTaskCreated,
  notifyTaskUpdated,
  notifyTaskDeleted,
  notifyTaskAssigned,
  notifyTaskUnassigned,
} from "../helpers/notificationHelper.js";

export default {
  getAllTasks: async (req, res) => {
    try {
      console.log("getTasks");
      if (req.session.user) {
        const { userId } = req.session.user;

        // First get the IDs of cases where the user is assigned
        const assignedTasks = await TaskAssignees.findAll({
          where: { userId },
          attributes: ["taskId"],
        });

        const assignedTaskIds = assignedTasks.map((ac) => ac.taskId);
        const tasks = await Task.findAll({
          where: {
            [Op.or]: [
              { ownerId: userId },
              { taskId: { [Op.in]: assignedTaskIds } },
            ],
          },
          include: [
            {
              model: User,
              as: "assignees",
              through: { attributes: [] },
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
              as: "owner",
              attributes: ["userId", "username", "firstName", "lastName"],
            },
            {
              model: Case,
              attributes: ["caseId", "title"],
              as: "case",
            },
          ],
        });

        res.send(tasks);
      } else {
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching tasks");
    }
  },
  getTodayTasks: async (req, res) => {
    try {
      console.log("getTodayTasks");
      if (req.session.user) {
        const { userId } = req.session.user;

        // Get today's date range (start and end of today)
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );

        // First get the IDs of tasks where the user is assigned
        const assignedTasks = await TaskAssignees.findAll({
          where: { userId },
          attributes: ["taskId"],
        });

        const assignedTaskIds = assignedTasks.map((ac) => ac.taskId);

        const tasks = await Task.findAll({
          where: {
            [Op.and]: [
              // User must be owner or assignee
              {
                [Op.or]: [
                  { ownerId: userId },
                  { taskId: { [Op.in]: assignedTaskIds } },
                ],
              },
              // Due date must be today
              {
                dueDate: {
                  [Op.between]: [startOfDay, endOfDay],
                },
              },
            ],
          },
          include: [
            {
              model: User,
              as: "assignees",
              through: { attributes: [] },
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
              as: "owner",
              attributes: ["userId", "username", "firstName", "lastName"],
            },
            {
              model: Case,
              attributes: ["caseId", "title"],
              as: "case",
            },
          ],
          order: [["dueDate", "ASC"]], // Sort by due date, earliest first
        });

        res.send(tasks);
      } else {
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching today's tasks");
    }
  },
  getTasksByCase: async (req, res) => {
    try {
      console.log("getTasksByCase");
      if (req.session.user) {
        const { caseId } = req.params;
        console.log(caseId);
        const tasks = await Task.findAll({
          where: { caseId },
          include: [
            {
              model: User,
              as: "assignees",
              through: { attributes: [] },
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
              as: "owner",
              attributes: ["userId", "username", "firstName", "lastName"],
            },
            {
              model: Case,
              attributes: ["caseId", "title"],
              as: "case",
            },
          ],
        });

        res.send(tasks);
      } else {
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log("getTasksByCase error:", error);
      res.status(500).send("Error fetching tasks");
    }
  },
  newTask: async (req, res) => {
    try {
      console.log("newTask");
      if (req.session.user) {
        const userId = req.session.user.userId;
        const newTask = await Task.create({
          ownerId: userId,
          title: req.body.title,
          notes: req.body.notes,
          caseId: req.body.caseId,
          dueDate: req.body.dueDate,
          priority: req.body.priority,
          status: req.body.status,
        });

        await createActivityLog({
          authorId: req.session.user.userId,
          objectType: "task",
          objectId: parseInt(newTask.taskId),
          action: ACTIVITY_ACTIONS.TASK_CREATED,
          details: "created this task",
        });

        // Sync with Google Calendar
        await syncTaskWithCalendar(newTask, userId, "create");

        // Create notifications for task creation
        const actorName =
          `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
          req.session.user.username;
        await notifyTaskCreated(newTask, userId, actorName);

        res.status(201).send(newTask);
      } else {
        console.log("no user logged in");
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to create task");
    }
  },
  saveTask: async (req, res) => {
    try {
      console.log("saveTask");
      if (req.session.user) {
        console.log(req.body);
        const { taskId, title, notes, caseId, dueDate, priority, status } =
          req.body;
        const currentTask = await Task.findOne({ where: { taskId } });

        currentTask.update({
          taskId,
          title,
          notes,
          caseId,
          dueDate,
          priority,
          status,
        });
      }
      res.status(200).send("Saved Task Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Task");
    }
  },
  getTask: async (req, res) => {
    try {
      console.log("getTask");
      if (req.session.user) {
        const { taskId } = req.params;
        const foundTask = await Task.findOne({
          where: { taskId },
          include: [
            {
              model: User,
              as: "assignees",
              through: { attributes: [] },
              attributes: [
                "userId",
                "username",
                "firstName",
                "lastName",
                "profilePic",
              ],
            },
            {
              model: Case,
              attributes: ["caseId", "title"],
              as: "case",
            },
          ],
        });

        res.send(foundTask);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  updateTask: async (req, res) => {
    try {
      console.log("updateTask");
      if (req.session.user) {
        const { taskId, fieldName, value } = req.body;
        let newCase = null;

        const currentTask = await Task.findOne({ where: { taskId } });
        const oldValue = currentTask[fieldName];
        await currentTask.update({ [fieldName]: value });

        if (fieldName === "caseId") {
          newCase = await Case.findOne({ where: { caseId: value } });
        }

        let message = `changed the ${fieldName} from ${oldValue} to ${value}`;

        if (fieldName === "title") {
          message = "changed the title";
        } else if (fieldName === "dueDate") {
          message = `changed the due date from ${formatDateNoTime(
            oldValue
          )} to ${formatDateNoTime(value)}`;
        } else if (fieldName === "caseId") {
          message = `assigned the task to ${newCase.title}`;
        }

        if (fieldName !== "notes") {
          await createActivityLog({
            authorId: req.session.user.userId,
            objectType: "task",
            objectId: parseInt(taskId),
            action: ACTIVITY_ACTIONS.TASK_UPDATED,
            details: message,
          });
        }

        // Sync with Google Calendar (only for certain fields that affect calendar events)
        if (["title", "dueDate", "notes"].includes(fieldName)) {
          await syncTaskWithCalendar(
            currentTask,
            req.session.user.userId,
            "update"
          );
        }

        // Create notifications for task updates (excluding notes)
        if (fieldName !== "notes") {
          const actorName =
            `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
            req.session.user.username;
          await notifyTaskUpdated(
            currentTask,
            req.session.user.userId,
            actorName,
            fieldName,
            oldValue,
            value
          );
        }

        if (fieldName === "caseId") {
          res.status(200).send(currentTask);
        } else res.status(200).send("Saved Task Successfully");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update task");
    }
  },
  updateTaskStatus: async (req, res) => {
    try {
      console.log("updateTaskStatus");
      if (req.session.user) {
        const { taskId, status } = req.body;
        const currentTask = await Task.findOne({ where: { taskId } });
        const oldStatus = currentTask.status;

        await currentTask.update({
          status,
        });

        // Create activity log
        await createActivityLog({
          authorId: req.session.user.userId,
          objectType: "task",
          objectId: parseInt(taskId),
          action: ACTIVITY_ACTIONS.TASK_UPDATED,
          details: `changed the status from ${oldStatus} to ${status}`,
        });

        // Sync with Google Calendar
        await syncTaskWithCalendar(
          currentTask,
          req.session.user.userId,
          "update"
        );

        // Create notifications for status change
        const actorName =
          `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
          req.session.user.username;
        await notifyTaskUpdated(
          currentTask,
          req.session.user.userId,
          actorName,
          "status",
          oldStatus,
          status
        );
      }
      res.status(200).send("Saved Task Status Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update task status");
    }
  },
  getTaskNonAssignees: async (req, res) => {
    try {
      console.log("getTaskNonAssignees");
      if (req.session.user) {
        const { taskId } = req.params;
        const taskExists = await Task.findByPk(taskId);
        if (!taskExists) {
          return res.status(404).send("Task not found");
        }

        const taskAssignees = await TaskAssignees.findAll({
          where: { taskId },
        });
        const assignedUserIds = taskAssignees.map((ca) => ca.dataValues.userId);
        const excludedUserIds = [...assignedUserIds, taskExists.ownerId];

        const nonAssignees = await User.findAll({
          where: {
            userId: {
              [Op.notIn]: excludedUserIds,
            },
          },
        });

        res.send(nonAssignees);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  addTaskAssignee: async (req, res) => {
    try {
      console.log("addTaskAssignee");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { taskId, userId } = req.body;
      console.log(taskId, userId);

      const taskExists = await Task.findByPk(taskId);
      if (!taskExists) {
        return res.status(404).send("Task not found");
      }

      // Check if assignment already exists
      const existingAssignment = await TaskAssignees.findOne({
        where: {
          taskId: parseInt(taskId),
          userId: parseInt(userId),
        },
      });

      if (existingAssignment) {
        return res.status(409).json({
          message: "User is already assigned to this task",
          assignment: existingAssignment,
        });
      }

      // Create new assignment if it doesn't exist
      const newAssignee = await TaskAssignees.create({
        taskId: parseInt(taskId),
        userId: parseInt(userId),
      });

      // Get the assigned user's name for the activity log
      const assignedUser = await User.findByPk(userId, {
        attributes: ["firstName", "lastName"],
      });

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "task",
        objectId: parseInt(taskId),
        action: ACTIVITY_ACTIONS.TASK_ASSIGNEE_ADDED,
        details: `added ${assignedUser.firstName} ${assignedUser.lastName} as assignee`,
      });

      // Create notifications for task assignment
      const actorName =
        `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
        req.session.user.username;
      const assigneeName =
        `${assignedUser.firstName} ${assignedUser.lastName}`.trim() ||
        "Unknown User";
      await notifyTaskAssigned(
        taskExists,
        userId,
        assigneeName,
        req.session.user.userId,
        actorName
      );

      res.status(201).json(newAssignee);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to add task assignee");
    }
  },
  removeTaskAssignee: async (req, res) => {
    try {
      console.log("removeTaskAssignee");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { taskId, userId } = req.body;
      const taskExists = await Task.findByPk(taskId);
      if (!taskExists) {
        return res.status(404).send("Task not found");
      }

      const oldAssignee = await User.findOne({
        where: {
          userId,
        },
      });

      await TaskAssignees.destroy({ where: { taskId, userId } });

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "task",
        objectId: parseInt(taskId),
        action: ACTIVITY_ACTIONS.TASK_ASSIGNEE_REMOVED,
        details: `removed ${oldAssignee.firstName} ${oldAssignee.lastName} as assignee`,
      });

      // Create notifications for task unassignment
      const actorName =
        `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
        req.session.user.username;
      const unassignedUserName =
        `${oldAssignee.firstName} ${oldAssignee.lastName}`.trim() ||
        "Unknown User";
      await notifyTaskUnassigned(
        taskExists,
        userId,
        unassignedUserName,
        req.session.user.userId,
        actorName
      );

      res.status(200).send("Task assignees updated successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update task assignees");
    }
  },
  deleteTask: async (req, res) => {
    try {
      console.log("deleteTask");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { taskId } = req.body;
      console.log(taskId);
      const currentTask = await Task.findByPk(taskId);
      if (!currentTask) {
        return res.status(404).send("Task not found");
      }
      const oldTitle = currentTask.title;

      // Sync with Google Calendar before deleting the task
      await syncTaskWithCalendar(
        currentTask,
        req.session.user.userId,
        "delete"
      );

      // Create notifications for task deletion (before deleting the task)
      const actorName =
        `${req.session.user.firstName} ${req.session.user.lastName}`.trim() ||
        req.session.user.username;
      await notifyTaskDeleted(currentTask, req.session.user.userId, actorName);

      await currentTask.destroy();

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "task",
        objectId: parseInt(taskId),
        action: ACTIVITY_ACTIONS.TASK_DELETED,
        details: `deleted ${oldTitle}`,
      });

      res.status(200).send("Task deleted successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to delete task");
    }
  },
};
