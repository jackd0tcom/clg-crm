import googleCalendarService from "../services/googleCalendar.js";
import { User } from "../model.js";

export default {
  // New endpoint for calendar setup during onboarding
  setupCalendar: async (req, res) => {
    try {
      const { accessToken } = req.body;
      const userId = req.session.user.userId;

      console.log("🔧 Setting up calendar for user:", userId);

      // Initialize calendar service with the access token
      await googleCalendarService.initializeCalendar(accessToken, null);

      // Create the app calendar
      const calendarId = await googleCalendarService.getOrCreateAppCalendar(userId);

      // Update user record with calendar connection
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          googleCalendarConnected: true,
          preferredCalendarId: calendarId
        });
      }

      console.log("✅ Calendar setup complete for user:", userId);

      res.json({ 
        success: true, 
        message: "Calendar setup complete",
        calendarId: calendarId
      });

    } catch (error) {
      console.error("❌ Calendar setup error:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to set up calendar"
      });
    }
  },

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

  // Create a calendar event from a task
  createTaskEvent: async (req, res) => {
    try {
      const { task } = req.body;
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

      const googleEvent = await googleCalendarService.createEventFromTask(task);

      res.json({ 
        message: "Calendar event created successfully",
        googleEventId: googleEvent.id 
      });
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Error creating calendar event" });
    }
  },

  // Update a calendar event from a task
  updateTaskEvent: async (req, res) => {
    try {
      const { task, googleEventId } = req.body;
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

      const googleEvent = await googleCalendarService.updateEventFromTask(task, googleEventId);

      res.json({ 
        message: "Calendar event updated successfully",
        googleEvent 
      });
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Error updating calendar event" });
    }
  },

  // Delete a calendar event
  deleteTaskEvent: async (req, res) => {
    try {
      const { googleEventId } = req.body;
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

      await googleCalendarService.deleteEvent(googleEventId);

      res.json({ message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Error deleting calendar event" });
    }
  },

  // Get or create the app-specific calendar
  getAppCalendar: async (req, res) => {
    try {
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

      const calendarId = await googleCalendarService.getAppCalendar(userId);

      res.json({ 
        message: "App calendar ready",
        calendarId: calendarId,
        calendarName: "CLG CMS Tasks"
      });
    } catch (error) {
      console.error("Error managing app calendar:", error);
      res.status(500).json({ message: "Error managing app calendar" });
    }
  },

  // Get list of user's calendars
  getUserCalendars: async (req, res) => {
    try {
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

      const calendars = await googleCalendarService.calendar.calendarList.list();
      const calendarList = calendars.data.items.map(cal => ({
        id: cal.id,
        name: cal.summary,
        description: cal.description || '',
        primary: cal.primary || false,
        accessRole: cal.accessRole
      }));

      res.json({ calendars: calendarList });
    } catch (error) {
      console.error("Error fetching user calendars:", error);
      res.status(500).json({ message: "Error fetching calendars" });
    }
  },

  // Update user's preferred calendar
  updatePreferredCalendar: async (req, res) => {
    try {
      const { calendarId } = req.body;
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

      await user.update({ preferredCalendarId: calendarId });

      res.json({ 
        message: "Preferred calendar updated successfully",
        preferredCalendarId: calendarId
      });
    } catch (error) {
      console.error("Error updating preferred calendar:", error);
      res.status(500).json({ message: "Error updating calendar preference" });
    }
  },

  // Check for duplicate app calendars and provide cleanup info
  checkAppCalendars: async (req, res) => {
    try {
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

      const calendars = await googleCalendarService.calendar.calendarList.list();
      const appCalendars = calendars.data.items.filter(
        cal => cal.summary === 'CLG CMS Tasks'
      );

      console.log(`🔍 Found ${appCalendars.length} CLG CMS Tasks calendars for user ${userId}`);
      appCalendars.forEach((cal, index) => {
        console.log(`   ${index + 1}. ID: ${cal.id}, Description: ${cal.description || 'No description'}`);
      });

      // Also log the current app calendar being used
      try {
        const currentAppCalendar = await googleCalendarService.getAppCalendar(userId);
        console.log(`🎯 Current app calendar being used: ${currentAppCalendar}`);
      } catch (error) {
        console.error("Error getting current app calendar:", error.message);
      }

      res.json({ 
        appCalendars: appCalendars.map(cal => ({
          id: cal.id,
          name: cal.summary,
          description: cal.description || '',
          primary: cal.primary || false,
          accessRole: cal.accessRole
        })),
        hasDuplicates: appCalendars.length > 1,
        recommendedAction: appCalendars.length > 1 
          ? `Found ${appCalendars.length} app calendars. Consider keeping only one and removing the others.`
          : 'No duplicate app calendars found.'
      });
    } catch (error) {
      console.error("Error checking app calendars:", error);
      res.status(500).json({ message: "Error checking app calendars" });
    }
  },
};
