import { User, Case } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";

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
        const { caseId } = req.body;
        const foundCase = await Case.findOne({ where: { caseId } });

        res.send(foundCase);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
};
