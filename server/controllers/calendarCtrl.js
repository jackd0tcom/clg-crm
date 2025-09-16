import googleCalendarService from "../services/googleCalendar.js";
import { User } from "../model.js";

export default {
  // New endpoint for calendar setup during onboarding
  setupCalendar: async (req, res) => {
    try {
      const userId = req.session.user.userId;

      console.log("🔧 Setting up calendar for user:", userId);

      // For now, we'll use the existing Google OAuth flow
      // The user needs to go through the Google OAuth process first
      const authUrl = googleCalendarService.getAuthUrl();
      
      res.json({ 
        success: true, 
        message: "Please complete Google OAuth flow",
        authUrl: authUrl
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
      
      // Check if user session exists
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log(`🔍 Fetching calendar events for user ${userId}`);

      const user = await User.findByPk(userId);
      if (!user) {
        console.log(`❌ User ${userId} not found in database`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`👤 User found: ${user.username || user.email || 'Unknown'}`);
      console.log(`🔑 Google tokens: accessToken=${!!user.googleAccessToken}, refreshToken=${!!user.googleRefreshToken}`);
      
      if (!user.googleAccessToken) {
        console.log(`❌ User ${userId} does not have Google Calendar connected`);
        return res
          .status(400)
          .json({ message: "Google Calendar not connected" });
      }

      console.log(`🔧 Initializing calendar service for user ${userId}`);
      const initSuccess = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!initSuccess) {
        return res.status(500).json({ 
          message: "Failed to initialize Google Calendar service" 
        });
      }

      // Check if tokens were refreshed and update database
      const refreshedTokens = googleCalendarService.getRefreshedTokens();
      if (refreshedTokens) {
        console.log("💾 Updating user tokens in database");
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      // Determine which calendar to use for fetching events
      let targetCalendarId = null;
      if (user.preferredCalendarId) {
        targetCalendarId = user.preferredCalendarId;
        console.log(`📅 Fetching events from preferred calendar: ${targetCalendarId}`);
      } else {
        targetCalendarId = await googleCalendarService.getPrimaryCalendar();
        console.log(`📅 Fetching events from primary calendar: ${targetCalendarId}`);
      }

      const events = await googleCalendarService.getEvents(timeMin, timeMax, targetCalendarId);

      console.log(`✅ Found ${events.length} events`);
      res.json({ events });
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      res.status(500).json({ 
        message: "Error fetching events",
        error: error.message 
      });
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

      const calendarId = await googleCalendarService.getPrimaryCalendar();

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

  // Get user's preferred calendar
  getPreferredCalendar: async (req, res) => {
    try {
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        preferredCalendarId: user.preferredCalendarId || null
      });
    } catch (error) {
      console.error("Error getting preferred calendar:", error);
      res.status(500).json({ message: "Error getting calendar preference" });
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

  // Get primary calendar info (simplified)
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

      // Get primary calendar info
      const primaryCalendarId = await googleCalendarService.getPrimaryCalendar();
      
      // Get calendar details
      const calendars = await googleCalendarService.calendar.calendarList.list();
      const primaryCalendar = calendars.data.items.find(cal => cal.id === primaryCalendarId);

      res.json({ 
        primaryCalendar: {
          id: primaryCalendar.id,
          summary: primaryCalendar.summary,
          description: primaryCalendar.description,
          primary: primaryCalendar.primary
        },
        message: "Using primary calendar for task sync"
      });
    } catch (error) {
      console.error("Error getting primary calendar info:", error);
      res.status(500).json({ 
        message: "Error getting calendar info",
        error: error.message 
      });
    }
  },
};
