import { User, Story, Friend } from "../model.js";

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
  getFriends: async (req, res) => {
    try {
      console.log("getFriends");
      if (req.session.user) {
        const { userId } = req.session.user;
        const friends = await User.findByPk(userId, {
          include: {
            model: User,
            as: "friends",
            through: { attributes: ["status"] },
          },
        });
        res.send(friends);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
