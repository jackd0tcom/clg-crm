import { User, Case } from "../model.js";
import { Op } from "sequelize";
import { CaseAssignees } from "../model.js";
import {
  Task,
  Person,
  PracticeArea,
  CasePracticeAreas,
  Tribunal,
  CaseTribunal,
} from "../model.js";

export default {
  getReportCases: async (req, res) => {
    try {
      console.log("getCases");
      if (req.session.user) {
        const cases = await Case.findAll({
          where: {
            isArchived: false,
          },
          //   include: [
          //     {
          //       model: User,
          //       as: "assignees",
          //       through: { attributes: [] },
          //       attributes: ["userId", "username", "firstName", "lastName"],
          //     },
          //     {
          //       model: User,
          //       as: "owner",
          //       attributes: ["userId", "username", "firstName", "lastName"],
          //     },
          //   ],
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
  getReportTasks: async (req, res) => {
    try {
      console.log("getTasks");
      if (req.session.user) {
        const tasks = await Task.findAll({
          where: {
            status: {
              [Op.ne]: "completed",
            },
          },
        });

        res.send(tasks);
      } else {
        res.status(401).send("User not authenticated");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching cases");
    }
  },
};
