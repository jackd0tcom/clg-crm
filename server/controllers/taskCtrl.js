import { User, Case, Task } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees, TaskAssignees } from "../model.js";

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
        res.send(newTask);
        console.log(newTask);
      } else console.log("no user logged in");
    } catch (error) {
      console.log(error);
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
  updateTaskStatus: async (req, res) => {
    try {
      console.log("updateTaskStatus");
      if (req.session.user) {
        const { taskId, status } = req.body;
        const currentTask = await Task.findOne({ where: { taskId } });
        currentTask.update({
          status,
        });
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
};
