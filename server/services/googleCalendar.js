import { google } from "googleapis";

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = null;
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
      if (!this.calendar) {
        throw new Error("Calendar service not initialized. Call initializeCalendar() first.");
      }
      
      // Use primary calendar
      const primaryCalendarId = await this.getPrimaryCalendar();
      
      const response = await this.calendar.events.list({
        calendarId: primaryCalendarId,
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


  // Get the user's primary calendar
  async getPrimaryCalendar() {
    try {
      if (!this.calendar) {
        throw new Error("Calendar service not initialized. Call initializeCalendar() first.");
      }
      
      const calendars = await this.calendar.calendarList.list();
      const primaryCalendar = calendars.data.items.find(cal => cal.primary === true);
      
      if (!primaryCalendar) {
        throw new Error("No primary calendar found for user");
      }
      
      console.log(`📅 Using primary calendar: ${primaryCalendar.summary} (${primaryCalendar.id})`);
      return primaryCalendar.id;
    } catch (error) {
      console.error("Error getting primary calendar:", error);
      throw error;
    }
  }

  // Legacy method - now just returns primary calendar
  async getOrCreateAppCalendar(userId = 'default') {
    console.log(`📅 Using primary calendar for user ${userId} (simplified approach)`);
    return await this.getPrimaryCalendar();
  }

  // Create a calendar event from a task (using primary calendar)
  async createEventFromTask(task, calendarId = null) {
    try {
      // Use primary calendar if not provided
      const targetCalendarId = calendarId || await this.getPrimaryCalendar();
      
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

  // Update a calendar event from a task (using primary calendar)
  async updateEventFromTask(task, googleEventId, calendarId = null) {
    try {
      // Use primary calendar if not provided
      const targetCalendarId = calendarId || await this.getPrimaryCalendar();
      
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

  // Delete a calendar event (using primary calendar)
  async deleteEvent(googleEventId, calendarId = null) {
    try {
      // Use primary calendar if not provided
      const targetCalendarId = calendarId || await this.getPrimaryCalendar();
      
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
