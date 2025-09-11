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
      const response = await this.calendar.events.list({
        calendarId: "primary",
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
}

export default new GoogleCalendarService();
