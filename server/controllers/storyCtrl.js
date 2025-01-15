import { User, Story } from "../model.js";

export default {
  saveStory: async (req, res) => {
    try {
      console.log("save");
      if (req.session.user) {
        const { storyContent, storyTitle, storyId } = req.body;
        const currentStory = await Story.findOne({ where: { storyId } });

        currentStory.update({
          title: storyTitle,
          content: storyContent,
        });
      }
      res.status(200).send("Saved Story Successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Failed to Save Story");
    }
  },
  newStory: async (req, res) => {
    try {
      console.log("newStory");
      if (req.session.user) {
        console.log(req.session.user);
        const userId = req.session.user.userId;
        const username = req.session.user.username;
        const newStory = await Story.create({
          userId,
          title: req.body.storyTitle,
          content: req.body.storyContent,
          author: username,
        });
        res.send(newStory);
        console.log(newStory);
      }
    } catch (error) {
      console.log(error);
    }
  },
  getStory: async (req, res) => {
    try {
      console.log("getStory");
      if (req.session.user) {
        const { storyId } = req.body;
        const story = await Story.findOne({ where: { storyId } });

        res.send(story);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  getAllStories: async (req, res) => {
    try {
      console.log("getAllStories");
      if (req.session.user) {
        const { userId } = req.session.user;
        const stories = await Story.findAll({ where: { userId } });

        res.send(stories);
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteStory: async (req, res) => {
    try {
      console.log("delete");
      if (req.session.user) {
        const { storyId } = req.params;
        await Story.destroy({ where: { storyId } });
        const userId = req.session.user.userId;
        console.log(userId);
        const newStories = await Story.findAll({ where: { userId } });
        res.send(newStories);
      }
    } catch (error) {
      console.log(error);
    }
  },
  getAllFriendStories: async (req, res) => {
    try {
      console.log("getAllStories");
      if (req.session.user) {
        const { friends } = req.session.user;
        const stories = await Promise.all(
          friends.map(async (friend) => {
            const friendsStories = await Story.findAll({
              where: { userId: friend.friendId },
              limit: 5,
            });
            const newStories = friendsStories.map((el) => {
              el.dataValues.username = friend.friendUsername;
              return el;
            });
            return {
              friend: friend,
              stories: newStories,
            };
          })
        );

        res.send(stories.flat());
      }
    } catch (error) {
      console.log(error);
    }
  },
  getTopStories: async (req, res) => {
    try {
      console.log("getTopStories");
      const list = await Story.findAll({
        where: { isPublished: true },
        limit: 20,
      });
      res.send(200, list);
    } catch (error) {
      console.log(error);
    }
  },
  publishStory: async (req, res) => {
    try {
      console.log("publishStory");
      const storyId = req.body.storyId;
      const foundStory = await Story.findOne({ where: { storyId } });
      console.log(foundStory);
      foundStory.update({ isPublished: true });
      res.send(200, "Published");
    } catch (error) {
      res.status(400, "Error publishing");
      console.log(error);
    }
  },
};
