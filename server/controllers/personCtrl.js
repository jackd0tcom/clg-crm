import { Case, User, Person } from "../model.js";
import {
  createActivityLog,
  ACTIVITY_ACTIONS,
  capitalize,
  format,
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
      await currentPerson.update({ [fieldName]: value });
      console.log(currentPerson);

      // Create activity log
      await createActivityLog({
        authorId: req.session.user.userId,
        objectType: "person",
        objectId: parseInt(personId),
        action: ACTIVITY_ACTIONS.PERSON_UPDATED,
        details: `Updated ${format(fieldName)} from ${oldValue} to ${value}`,
      });

      res.status(200).send("Saved Person Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to update person");
    }
  },
};
