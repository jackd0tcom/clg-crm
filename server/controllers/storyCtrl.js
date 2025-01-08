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
        const userId = req.session.user.userId;
        const newStory = await Story.create({
          userId,
          title: req.body.storyTitle,
          content: req.body.storyContent,
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
};
