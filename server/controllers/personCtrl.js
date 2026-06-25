import { Case, User, Person, CasePerson } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
  spaceOut,
} from "../helpers/activityHelper.js";

export default {
  updatePerson: async (req, res) => {
    try {
      console.log("updatePerson");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { personId, fieldName, value } = req.body;
      console.log(personId, fieldName, value);
      const currentPerson = await Person.findOne({ where: { personId } });

      if (!currentPerson) {
        return res.status(404).send("Person not found");
      }

      const oldValue = currentPerson[fieldName];
      let message = `updated ${currentPerson.firstName}'s ${spaceOut(
        fieldName,
      )}`;
      if (oldValue === null) {
        message = `added ${format(fieldName).toLowerCase()} to ${
          currentPerson.firstName
        }`;
      }
      await currentPerson.update({ [fieldName]: value });
      console.log(currentPerson);

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "person",
        objectId: parseInt(personId),
        action: ACTIVITY_ACTIONS.PERSON_UPDATED,
        details: message,
      });

      res.status(200).send("Saved Person Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  newPerson: async (req, res) => {
    try {
      console.log("newPerson");
      const { caseId, fieldName, value, type } = req.body;
      const newPerson = await Person.create({ [fieldName]: value });
      await CasePerson.create({
        caseId,
        personId: newPerson.personId,
        type: type || "client",
      });

      console.log(newPerson);

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "person",
        objectId: parseInt(newPerson.personId),
        action: ACTIVITY_ACTIONS.PERSON_CREATED,
        details: `added ${newPerson.firstName} to the case`,
      });
      res.status(200).send({ ...newPerson.toJSON(), type: type || "client" });
    } catch (error) {
      console.log(error);
    }
  },
  getPeople: async (req, res) => {
    try {
      console.log("getPeople");

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const people = await Person.findAll({
        order: [["lastName", "ASC"]],
      });

      if (people && people.length > 0) {
        res.status(200).send(people);
      } else res.status(404).send("no people found");
    } catch (error) {
      console.log(error);
    }
  },
  deletePerson: async (req, res) => {
    try {
      console.log("deletePerson");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { personId, caseId } = req.body;
      console.log(personId, caseId);
      const currentPerson = await Person.findOne({ where: { personId } });

      if (!currentPerson) {
        return res.status(404).send("Person not found");
      }

      const casePerson = await CasePerson.findOne({
        where: { personId, caseId },
      });

      if (!casePerson) {
        return res.status(404).send("Person not found on this case");
      }

      await casePerson.destroy();
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "case",
        objectId: caseId,
        action: ACTIVITY_ACTIONS.PERSON_REMOVED,
        details: `removed ${currentPerson.firstName} ${currentPerson.lastName} from the case`,
      });

      res.status(200).send("Person removed from case successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to remove person from case");
    }
  },
  assignPersonToCase: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { personId, caseId, type } = req.body;
      const person = await Person.findByPk(personId);

      if (!person) {
        return res.status(404).send("Person not found");
      }

      const existing = await CasePerson.findOne({
        where: { personId, caseId },
      });

      if (existing) {
        return res.status(409).send("Person is already on this case");
      }

      await CasePerson.create({
        caseId,
        personId,
        type: type || "client",
      });

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "person",
        objectId: parseInt(personId),
        action: ACTIVITY_ACTIONS.PERSON_CREATED,
        details: `added ${person.firstName} ${person.lastName} to the case`,
      });

      res.status(200).send({ ...person.toJSON(), type: type || "client" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to assign person to case");
    }
  },
};
