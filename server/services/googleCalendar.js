import { google } from "googleapis";

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = null;
    this.calendarCreationLock = new Map(); // Lock per user to prevent duplicate creation
  }

  _ensureOAuth2Client() {
    if (!this.oauth2Client) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    }
    return this.oauth2Client;
  }

  getAuthUrl() {
    const oauth2Client = this._ensureOAuth2Client();

    const scopes = ["https://www.googleapis.com/auth/calendar"];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  async getTokens(code) {
    try {
      const oauth2Client = this._ensureOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error("Error getting tokens:", error);
      throw error;
    }
  }

  async initializeCalendar(accessToken, refreshToken) {
    try {
      const oauth2Client = this._ensureOAuth2Client();
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      this.calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });
      return true;
    } catch (error) {
      console.error("Error initializing calendar:", error);
      return false;
    }
  }

  async getEvents(timeMin, timeMax) {
    try {
      // Get app calendar ID (assumes it exists)
      const appCalendarId = await this.getAppCalendar();
      
      const response = await this.calendar.events.list({
        calendarId: appCalendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }


  // Get the app-specific calendar (assumes it exists from signup)
  async getAppCalendar(userId = 'default') {
    try {
      const calendarName = 'CLG CMS Tasks';
      
      console.log(`🔍 Finding existing app calendar: "${calendarName}"`);
      
      // Find existing app calendar
      const calendars = await this.calendar.calendarList.list();
      const appCalendar = calendars.data.items.find(
        cal => cal.summary === calendarName
      );

      if (!appCalendar) {
        throw new Error(`App calendar "${calendarName}" not found. User may need to complete calendar setup.`);
      }

      console.log(`✅ Found app calendar: ${appCalendar.id}`);
      return appCalendar.id;
    } catch (error) {
      console.error("❌ Error getting app calendar:", error);
      throw error;
    }
  }

  // Get or create the app-specific calendar (legacy method - kept for backward compatibility)
  async getOrCreateAppCalendar(userId = 'default') {
    try {
      const calendarName = 'CLG CMS Tasks';
      const uniqueId = `clg-cms-${Date.now()}`;
      
      // Check if another request is already creating a calendar for this user
      const lockKey = `calendar-creation-${userId}`;
      if (this.calendarCreationLock.has(lockKey)) {
        console.log(`🔒 Calendar creation already in progress for user ${userId}. Waiting...`);
        // Wait for the other request to complete
        while (this.calendarCreationLock.has(lockKey)) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log(`🔓 Lock released for user ${userId}. Checking for created calendar...`);
      }
      
      console.log(`🔍 Searching for existing calendars with name: "${calendarName}"`);
      
      // First, try to find existing app calendar
      const calendars = await this.calendar.calendarList.list();
      console.log(`📋 Found ${calendars.data.items.length} total calendars in user's account`);
      
      // Log all calendar names for debugging
      const allCalendarNames = calendars.data.items.map(cal => cal.summary);
      console.log(`📝 All calendar names:`, allCalendarNames);
      
      // Look for existing calendars with our app name
      const existingCalendars = calendars.data.items.filter(
        cal => cal.summary === calendarName
      );

      console.log(`🎯 Found ${existingCalendars.length} calendars matching "${calendarName}"`);

      if (existingCalendars.length > 0) {
        // Use the first existing calendar
        const calendar = existingCalendars[0];
        console.log(`✅ Using existing app calendar: ${calendar.id} (${calendar.summary})`);
        
        // If there are multiple, log a warning with details
        if (existingCalendars.length > 1) {
          console.warn(`⚠️ DUPLICATE CALENDARS DETECTED! Found ${existingCalendars.length} calendars with name "${calendarName}":`);
          existingCalendars.forEach((cal, index) => {
            console.warn(`   ${index + 1}. ID: ${cal.id}, Summary: ${cal.summary}, Primary: ${cal.primary}`);
          });
          console.warn(`   Using the first one: ${calendar.id}`);
        }
        
        return calendar.id;
      }

      // Set lock to prevent other requests from creating calendars
      console.log(`🔒 Setting creation lock for user ${userId}`);
      this.calendarCreationLock.set(lockKey, true);

      try {
        console.log(`🆕 No existing calendar found. Creating new calendar: "${calendarName}"`);

        // Create new app calendar if it doesn't exist
        const newCalendar = {
          summary: calendarName,
          description: `Task management calendar for CLG CMS - Created automatically (${uniqueId})`,
          timeZone: 'America/Los_Angeles'
        };

        console.log(`🚀 Attempting to create calendar with data:`, newCalendar);
        const createdCalendar = await this.calendar.calendars.insert({
          resource: newCalendar
        });

        console.log(`✅ Successfully created new app calendar: ${createdCalendar.data.id}`);
        console.log(`📅 Calendar details:`, {
          id: createdCalendar.data.id,
          summary: createdCalendar.data.summary,
          description: createdCalendar.data.description
        });
        
        return createdCalendar.data.id;
      } catch (createError) {
        // If creation fails, it might be because the calendar already exists
        console.error(`❌ Failed to create calendar:`, createError.message);
        console.warn("🔍 Checking if calendar was created by another process...");
        
        // Wait a moment for Google's API to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to find it again after creation attempt
        const retryCalendars = await this.calendar.calendarList.list();
        const retryExisting = retryCalendars.data.items.find(
          cal => cal.summary === calendarName
        );
        
        if (retryExisting) {
          console.log(`✅ Found existing app calendar on retry: ${retryExisting.id}`);
          return retryExisting.id;
        }
        
        // If we still can't find it, throw the original error
        console.error(`❌ Calendar not found even after retry. Original error:`, createError);
        throw createError;
      } finally {
        // Always release the lock
        console.log(`🔓 Releasing creation lock for user ${userId}`);
        this.calendarCreationLock.delete(lockKey);
      }
    } catch (error) {
      console.error("❌ Error managing app calendar:", error);
      throw error;
    }
  }

  // Create a calendar event from a task (using app calendar)
  async createEventFromTask(task, calendarId = null) {
    try {
      // Get app calendar ID if not provided
      const targetCalendarId = calendarId || await this.getOrCreateAppCalendar();
      
      const event = {
        summary: task.title,
        description: task.notes || '',
        start: {
          dateTime: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: task.dueDate ? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        extendedProperties: {
          private: {
            cmsTaskId: task.taskId.toString(),
            cmsCaseId: task.caseId ? task.caseId.toString() : '',
          }
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: targetCalendarId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  // Update a calendar event from a task (using app calendar)
  async updateEventFromTask(task, googleEventId, calendarId = null) {
    try {
      // Get app calendar ID if not provided
      const targetCalendarId = calendarId || await this.getOrCreateAppCalendar();
      
      const event = {
        summary: task.title,
        description: task.notes || '',
        start: {
          dateTime: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: task.dueDate ? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        extendedProperties: {
          private: {
            cmsTaskId: task.taskId.toString(),
            cmsCaseId: task.caseId ? task.caseId.toString() : '',
          }
        }
      };

      const response = await this.calendar.events.update({
        calendarId: targetCalendarId,
        eventId: googleEventId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }

  // Delete a calendar event (using app calendar)
  async deleteEvent(googleEventId, calendarId = null) {
    try {
      // Get app calendar ID if not provided
      const targetCalendarId = calendarId || await this.getOrCreateAppCalendar();
      
      await this.calendar.events.delete({
        calendarId: targetCalendarId,
        eventId: googleEventId,
      });
      return true;
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw error;
    }
  }
}

export default new GoogleCalendarService();
