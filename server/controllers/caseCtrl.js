import { User, Case } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";
import { Task, Person, PracticeArea, CasePracticeAreas } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
} from "../helpers/activityHelper.js";

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
          {
            model: PracticeArea,
            as: "practiceAreas",
            through: { attributes: [] },
            attributes: ["practiceAreaId", "name"],
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
          notes: req.body.notes || "",
          phase: req.body.phase || "intake",
          priority: req.body.priority || "normal",
        });

        // Create the case owner as an assignee
        await CaseAssignees.create({
          caseId: newCase.caseId,
          userId: req.session.user.userId,
        });

        // Log the activity
        await createActivityLog({
          authorId: req.session.user.userId,
          objectType: "case",
          objectId: newCase.caseId,
          action: ACTIVITY_ACTIONS.CASE_CREATED,
          details: `Created new case: ${newCase.title}`,
        });

        // Return the created case with basic info
        res.status(201).json({
          caseId: newCase.caseId,
          title: newCase.title,
          phase: newCase.phase,
          priority: newCase.priority,
          status: newCase.status,
          notes: newCase.notes,
          clientName: newCase.clientName,
          practiceAreas: [],
          people: [],
          assignees: [req.session.user],
          tasks: [],
        });
      } else console.log("no user logged in");
    } catch (error) {
      console.log(error);
    }
  },
  getLatestCase: async (req, res) => {
    try {
      console.log("getNewCaseId");
      if (req.session.user) {
        const userId = req.session.user.userId;
        const latestCase = await Case.findOne({
          order: [["createdAt", "DESC"]],
        });
        res.send(latestCase);
      } else console.log("no user logged in");
    } catch (error) {
      console.log(error);
    }
  },

  saveCase: async (req, res) => {
    try {
      console.log("save");
      if (req.session.user) {
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
            {
              model: PracticeArea,
              as: "practiceAreas",
              through: { attributes: [] },
              attributes: ["practiceAreaId", "name"],
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

        const people = await Person.findAll({ where: { caseId } });
        const data = {
          ...foundCase.toJSON(),
          tasks: tasks,
          people: people,
        };

        res.send(data);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  updateCase: async (req, res) => {
    try {
      console.log("updateCase");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, fieldName, value } = req.body;
      const currentCase = await Case.findOne({ where: { caseId } });

      if (!currentCase) {
        return res.status(404).send("Case not found");
      }

      const oldValue = currentCase[fieldName];
      await currentCase.update({ [fieldName]: value });

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_UPDATED,
        details: `changed the ${format(
          fieldName
        )} from ${oldValue} to ${value}`,
      });

      res.status(200).send("Saved Case Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update case");
    }
  },
  updateCasePhase: async (req, res) => {
    try {
      console.log("updateCasePhase");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, phase } = req.body;
      const currentCase = await Case.findOne({ where: { caseId } });

      if (!currentCase) {
        return res.status(404).send("Case not found");
      }

      const oldPhase = currentCase.phase;
      await currentCase.update({ phase });

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_PHASE_CHANGED,
        details: `Changed case phase from ${oldPhase} to ${phase}`,
      });

      res.status(200).send("Saved Case Phase Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Case Phase");
    }
  },
  updateCasePriority: async (req, res) => {
    try {
      console.log("updateCasePriority");
      if (req.session.user) {
        const { caseId, priority } = req.body;
        const currentCase = await Case.findOne({ where: { caseId } });
        const oldPriority = currentCase.priority;

        currentCase.update({
          priority,
        });

        await createActivityLog({
          authorId: req.session.user.userId,
          objectType: "case",
          objectId: parseInt(caseId),
          action: ACTIVITY_ACTIONS.CASE_PRIORITY_CHANGED,
          details: `Changed case priority from ${oldPriority} to ${priority}`,
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

      // Get the assigned user's name for the activity log
      const assignedUser = await User.findByPk(userId, {
        attributes: ["firstName", "lastName"],
      });

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_ASSIGNEE_ADDED,
        details: `Added ${assignedUser.firstName} ${assignedUser.lastName} as assignee`,
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

      const oldAssignee = await User.findOne({
        where: {
          userId,
        },
      });

      await CaseAssignees.destroy({ where: { caseId, userId } });

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_ASSIGNEE_REMOVED,
        details: `Removed ${oldAssignee.firstName} ${oldAssignee.lastName} as assignee`,
      });

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
  addCasePracticeArea: async (req, res) => {
    try {
      console.log("addCasePracticeArea");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, practiceAreaId } = req.body;

      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).send("Case not found");
      }

      const practiceAreaExists = await PracticeArea.findByPk(practiceAreaId);
      if (!practiceAreaExists) {
        return res.status(404).send("Practice area not found");
      }

      const existingAssignment = await CasePracticeAreas.findOne({
        where: {
          caseId,
          practiceAreaId,
        },
      });

      if (existingAssignment) {
        return res.status(409).json({
          message: "Practice area already assigned to this case",
          assignment: existingAssignment,
        });
      }

      const newAssignment = await CasePracticeAreas.create({
        caseId,
        practiceAreaId,
      });

      res.status(201).json(newAssignment);

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_PRACTICE_AREA_ADDED,
        details: `Added ${practiceAreaExists.name} as practice area`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to add case practice area");
    }
  },
  removeCasePracticeArea: async (req, res) => {
    try {
      console.log("addCasePracticeArea");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { caseId, practiceAreaId } = req.body;

      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).send("Case not found");
      }

      const practiceAreaExists = await PracticeArea.findByPk(practiceAreaId);
      if (!practiceAreaExists) {
        return res.status(404).send("Practice area not found");
      }

      const existingAssignment = await CasePracticeAreas.findOne({
        where: {
          caseId,
          practiceAreaId,
        },
      });

      if (!existingAssignment) {
        return res.status(409).json({
          message: "Practice area is not already assigned to this case",
          assignment: existingAssignment,
        });
      }
      await existingAssignment.destroy();

      res.status(200).send("Practice area removed");

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: parseInt(caseId),
        action: ACTIVITY_ACTIONS.CASE_PRACTICE_AREA_REMOVED,
        details: `Removed ${practiceAreaExists.name} as practice area`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to add case practice area");
    }
  },
  getPracticeAreas: async (req, res) => {
    try {
      console.log("getPracticeAreas");
      if (req.session.user) {
        const practiceAreas = await PracticeArea.findAll({});
        res.send(practiceAreas);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
};
