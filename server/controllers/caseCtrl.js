import { User, Case } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";
import { Task } from "../model.js";

export default {
  getCases: async (req, res) => {
    try {
      console.log("getCases");
      if (req.session.user) {
        const { userId } = req.session.user;

        // First get the IDs of cases where the user is assigned
        const assignedCases = await CaseAssignees.findAll({
          where: { userId },
          attributes: ["caseId"],
        });

        const assignedCaseIds = assignedCases.map((ac) => ac.caseId);
        const cases = await Case.findAll({
          where: {
            [Op.or]: [
              { ownerId: userId },
              { caseId: { [Op.in]: assignedCaseIds } },
            ],
          },
          include: [
            {
              model: User,
              as: "assignees",
              through: { attributes: [] },
              attributes: ["userId", "username", "firstName", "lastName"],
            },
            {
              model: User,
              as: "owner",
              attributes: ["userId", "username", "firstName", "lastName"],
            },
          ],
        });

        res.send(cases);
      } else {
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching cases");
    }
  },
  getCasesWithTasks: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { userId } = req.session.user;

      // First get the IDs of cases where the user is assigned
      const assignedCases = await CaseAssignees.findAll({
        where: { userId },
        attributes: ["caseId"],
      });

      const assignedCaseIds = assignedCases.map((ac) => ac.caseId);

      // Get cases where user is owner OR assigned
      const cases = await Case.findAll({
        where: {
          [Op.or]: [
            { ownerId: userId },
            { caseId: { [Op.in]: assignedCaseIds } },
          ],
        },
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["userId", "username", "firstName", "lastName"],
          },
          {
            model: User,
            as: "assignees",
            through: { attributes: [] },
            attributes: ["userId", "username", "firstName", "lastName"],
          },
        ],
        order: [["updatedAt", "DESC"]], // Most recently updated cases first
      });

      // Now get tasks for each case separately to avoid the complex nested query
      const casesWithTasks = await Promise.all(
        cases.map(async (caseData) => {
          const caseJson = caseData.toJSON();

          // Get up to 5 tasks for this case
          const tasks = await Task.findAll({
            where: { caseId: caseData.caseId },
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["username", "firstName", "lastName"],
              },
              {
                model: User,
                as: "assignees",
                through: { attributes: [] },
                attributes: ["username", "firstName", "lastName"],
              },
            ],
            order: [
              ["dueDate", "ASC"],
              ["createdAt", "DESC"],
            ],
            limit: 5,
          });

          return {
            ...caseJson,
            tasks: tasks,
          };
        })
      );

      res.json(casesWithTasks);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching cases with tasks");
    }
  },
  newCase: async (req, res) => {
    try {
      console.log("newCase");
      if (req.session.user) {
        const userId = req.session.user.userId;
        const newCase = await Case.create({
          ownerId: userId,
          title: req.body.title,
          clientName: req.body.clientName,
          notes: req.body.notes,
          practiceArea: req.body.practiceArea,
          phase: req.body.phase,
          priority: req.body.priority,
          status: req.body.status,
        });
        res.send(newCase);
        console.log(newCase);
      } else console.log("no user logged in");
    } catch (error) {
      console.log(error);
    }
  },
  saveCase: async (req, res) => {
    try {
      console.log("save");
      if (req.session.user) {
        console.log(req.body);
        const {
          caseId,
          caseTitle,
          caseClientName,
          caseNotes,
          casePracticeArea,
          casePhase,
          casePriority,
          caseStatus,
        } = req.body;
        const currentCase = await Case.findOne({ where: { caseId } });

        currentCase.update({
          title: caseTitle,
          clientName: caseClientName,
          notes: caseNotes,
          practiceArea: casePracticeArea,
          phase: casePhase,
          priority: casePriority,
          status: caseStatus,
        });
      }
      res.status(200).send("Saved Case Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Case");
    }
  },
  getCase: async (req, res) => {
    try {
      console.log("getCase");
      if (req.session.user) {
        const { caseId } = req.params;
        let foundCase = await Case.findOne({
          where: { caseId },
          include: [
            {
              model: User,
              as: "owner",
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
          ],
        });

        // Get tasks with their assignees
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

        const data = { ...foundCase.toJSON(), tasks: tasks };

        res.send(data);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  updateCasePhase: async (req, res) => {
    try {
      console.log("updateCasePhase");
      if (req.session.user) {
        const { caseId, phase } = req.body;
        const currentCase = await Case.findOne({ where: { caseId } });

        currentCase.update({
          phase,
        });
      }
      res.status(200).send("Saved Case Phase Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Case");
    }
  },
  updateCasePriority: async (req, res) => {
    try {
      console.log("updateCasePriority");
      if (req.session.user) {
        const { caseId, priority } = req.body;
        const currentCase = await Case.findOne({ where: { caseId } });

        currentCase.update({
          priority,
        });
      }
      res.status(200).send("Saved Case Priority Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Case Priority");
    }
  },
  updateCaseNotes: async (req, res) => {
    try {
      console.log("updateCaseNotes");
      if (req.session.user) {
        const { caseId, notes } = req.body;
        const currentCase = await Case.findOne({ where: { caseId } });

        currentCase.update({
          notes,
        });
      }
      res.status(200).send("Saved Case Notes Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Case notes");
    }
  },
  addCaseAssignee: async (req, res) => {
    try {
      console.log("addCaseAssignee");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, userId } = req.body;

      console.log(caseId, userId);

      // Validate that the case exists
      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).send("Case not found");
      }

      // Check if assignment already exists
      const existingAssignment = await CaseAssignees.findOne({
        where: {
          caseId: parseInt(caseId),
          userId: parseInt(userId),
        },
      });

      if (existingAssignment) {
        return res.status(409).json({
          message: "User is already assigned to this case",
          assignment: existingAssignment,
        });
      }

      // Create new assignment if it doesn't exist
      const newAssignee = await CaseAssignees.create({
        caseId: parseInt(caseId),
        userId: parseInt(userId),
      });

      res.status(201).json(newAssignee);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to add case assignee");
    }
  },
  removeCaseAssignee: async (req, res) => {
    try {
      console.log("removeCaseAssignee");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, userId } = req.body;
      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).send("Case not found");
      }

      await CaseAssignees.destroy({ where: { caseId, userId } });

      res.status(200).send("Case assignees updated successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update case assignees");
    }
  },
  getCaseNonAssignees: async (req, res) => {
    try {
      console.log("getCaseNonAssignees");
      if (req.session.user) {
        const { caseId } = req.params;
        console.log(caseId);
        const caseExists = await Case.findByPk(caseId);
        if (!caseExists) {
          return res.status(404).send("Case not found");
        }

        const caseAssignees = await CaseAssignees.findAll({
          where: { caseId },
        });
        const assignedUserIds = caseAssignees.map((ca) => ca.dataValues.userId);
        const excludedUserIds = [...assignedUserIds, caseExists.ownerId];

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
