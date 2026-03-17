import { User, UserSettings } from "../model.js";

export default {
  getUser: async (req, res) => {
    try {
      console.log("getUser");
      const { userId } = req.params;
      console.log(userId);
      const user = await User.findByPk(userId);
      res.status(200).send(user);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
  getUsers: async (req, res) => {
    try {
      console.log("getUsers");
      const users = await User.findAll();
      res.status(200).send(users);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
  getUserSettings: async (req, res) => {
    try {
      console.log("getUserSettings");

      if (!req.session.user) {
        res.status(401).send("User not authenticated");
        return;
      }

      const userSettings = await UserSettings.findOne({
        where: { userId: req.session.user.userId },
      });

      if (!userSettings) {
        res.status(404).send("User settings not found");
        return;
      }
      res.status(200).send(userSettings);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
  updateUserSettings: async (req, res) => {
    try {
      console.log("getUserSettings");

      if (!req.session.user) {
        res.status(401).send("User not authenticated");
        return;
      }

      const { fieldName, value } = req.body;

      const userSettings = await UserSettings.findOne({
        where: { userId: req.session.user.userId },
      });

      if (!userSettings) {
        res.status(404).send("User settings not found");
        return;
      }

      const updatedSettings = await userSettings.update({
        [fieldName]: value,
      });

      if (!updatedSettings) {
        res.status(404).send("User settings failed to update");
        return;
      }

      res.status(200).send(updatedSettings);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
};
