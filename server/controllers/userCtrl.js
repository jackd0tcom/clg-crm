import { User } from "../model.js";

export default {
  getUser: async (req, res) => {
    try {
      console.log("getUser");
      const { userId } = req.params;
      console.log(userId);
      const user = await User.findByPk(userId, {
        include: {
          model: User,
          as: "friends",
          through: { attributes: ["status"] },
        },
      });
      res.status(200).send(user);
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
};
