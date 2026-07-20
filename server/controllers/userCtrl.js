import { User, UserSettings, Rate } from "../model.js";

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

      const rates = await Rate.findAll({ order: [["rateId", "DESC"]] });

      if (!userSettings) {
        res.status(404).send(rates);
        return;
      }

      const userData = userSettings.toJSON();

      const payload = {
        ...userData,
        rates: rates,
      };

      res.status(200).send(payload);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to save user settings");
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
        const newSettings = await UserSettings.create({
          userId: req.session.user.userId,
          [fieldName]: value,
        });
        res.status(200).send(newSettings);
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
      res.status(500).send(err);
    }
  },
  updateRate: async (req, res) => {
    try {
      console.log("updateRate");

      if (!req.session.user) {
        res.status(401).send("User not authenticated");
        return;
      }

      const { rateId, value } = req.body;

      const rate = await Rate.findOne({
        where: { rateId },
      });

      if (!rate) {
        res.status(404).send("rate not found");
        return;
      }

      const updatedRate = await rate.update({
        rate: value,
      });

      if (!updatedRate) {
        res.status(404).send("rate failed to update");
        return;
      }

      const allRates = await Rate.findAll({ order: [["rateId", "DESC"]] });

      res.status(200).send(allRates);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
