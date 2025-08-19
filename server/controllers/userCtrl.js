import { User } from "../model.js";

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
};
