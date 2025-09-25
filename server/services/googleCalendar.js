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

      // Force token refresh to ensure we have valid credentials
      if (refreshToken) {
        try {
          console.log("🔄 Refreshing Google Calendar tokens...");
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);
          console.log("✅ Tokens refreshed successfully");
          
          // Store the refreshed tokens for potential future use
          this.refreshedTokens = credentials;
        } catch (refreshError) {
          console.warn("⚠️ Token refresh failed, using provided tokens:", refreshError.message);
          // Continue with provided tokens if refresh fails
        }
      }

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

  // Get refreshed tokens if available
  getRefreshedTokens() {
    return this.refreshedTokens || null;
  }

  async getEvents(timeMin, timeMax, calendarId = null) {
    try {
      if (!this.calendar) {
        throw new Error("Calendar service not initialized. Call initializeCalendar() first.");
      }
      
      // Use provided calendarId or fall back to primary calendar
      let targetCalendarId = calendarId;
      if (!targetCalendarId) {
        targetCalendarId = await this.getPrimaryCalendar();
      }
      
      const params = {
        calendarId: targetCalendarId,
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      };

      // Only add timeMin if it's provided
      if (timeMin) {
        params.timeMin = timeMin;
      }
      
      // Only add timeMax if it's provided
      if (timeMax) {
        params.timeMax = timeMax;
      }

      const response = await this.calendar.events.list(params);

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      
      // Provide more specific error messages
      if (error.code === 401) {
        throw new Error("Google Calendar authentication failed. Please reconnect your calendar.");
      } else if (error.code === 403) {
        throw new Error("Access denied to Google Calendar. Please check permissions.");
      } else if (error.code === 404) {
        throw new Error("Calendar not found. Please check your calendar selection.");
      }
      
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
