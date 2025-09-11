import googleCalendarService from "../services/googleCalendar.js";
import { User } from "../model.js";

export default {
  getAuthUrl: async (req, res) => {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error getting auth URL:", error);
      res.status(500).json({ message: "Error getting authorization URL" });
    }
  },

  handleCallback: async (req, res) => {
    try {
      const { code } = req.body;
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const tokens = await googleCalendarService.getTokens(code);

      await User.update(
        {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: new Date(tokens.expiry_date),
        },
        { where: { userId } }
      );

      res.json({ message: "Google Calendar connected successfully" });
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      res.status(500).json({ message: "Error connecting to Google Calendar" });
    }
  },

  checkConnection: async (req, res) => {
    try {
      const { userId } = req.session.user;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findByPk(userId);
      const isConnected = !!(user.googleAccessToken && user.googleRefreshToken);

      res.json({ isConnected });
    } catch (error) {
      console.error("Error checking connection:", error);
      res.status(500).json({ message: "Error checking connection" });
    }
  },

  getCalendarEvents: async (req, res) => {
    try {
      const { timeMin, timeMax } = req.query;
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findByPk(userId);
      if (!user.googleAccessToken) {
        return res
          .status(400)
          .json({ message: "Google Calendar not connected" });
      }

      await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );

      const events = await googleCalendarService.getEvents(timeMin, timeMax);

      res.json({ events });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  },
};
