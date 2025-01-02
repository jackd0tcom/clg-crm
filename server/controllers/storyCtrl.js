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
    } catch (err) {
      console.log(err);
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
        const { storyId } = req.body;
        await Story.destroy({ where: { storyId } });
        const newStories = await Story.findAll({ where: { userId } });
        res.send(newStories);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
