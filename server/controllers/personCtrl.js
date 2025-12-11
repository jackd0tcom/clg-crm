import { Case, User, Person } from "../model.js";
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
        fieldName
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
      const newPerson = await Person.create({ caseId, [fieldName]: value });
      await newPerson.update({ type: type });

      console.log(newPerson);

      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "person",
        objectId: parseInt(newPerson.personId),
        action: ACTIVITY_ACTIONS.PERSON_CREATED,
        details: `added ${newPerson.firstName} to the case`,
      });
      res.status(200).send(newPerson);
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

      const { personId } = req.body;
      console.log(personId);
      const currentPerson = await Person.findOne({ where: { personId } });

      if (!currentPerson) {
        return res.status(404).send("Person not found");
      }
      const caseId = currentPerson.caseId;

      await currentPerson.destroy();
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
};
