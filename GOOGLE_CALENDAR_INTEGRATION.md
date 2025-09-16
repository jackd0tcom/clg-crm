# Google Calendar Integration Documentation

## Overview

This document explains how the Google Calendar integration works in the CLG CRM application. The integration allows users to sync their tasks with Google Calendar, view events in a calendar interface, and manage their preferred calendar for task synchronization.

## Architecture

The integration consists of several key components:

1. **Backend Services** - Handle Google OAuth and Calendar API interactions
2. **Frontend Components** - Provide user interface for calendar management
3. **Database Models** - Store user calendar preferences and tokens
4. **Authentication Flow** - Google OAuth 2.0 integration

## Key Components

### 1. Backend Services

#### `server/services/googleCalendar.js`
The main service class that handles all Google Calendar API interactions.

**Key Methods:**
- `getAuthUrl()` - Generates Google OAuth authorization URL
- `getTokens(code)` - Exchanges authorization code for access/refresh tokens
- `initializeCalendar(accessToken, refreshToken)` - Sets up the Google Calendar API client with automatic token refresh
- `getPrimaryCalendar()` - Gets the user's primary Google Calendar
- `getEvents(timeMin, timeMax, calendarId)` - Fetches events from specified calendar
- `createEventFromTask(task, calendarId)` - Creates a Google Calendar event from a task
- `updateEventFromTask(task, googleEventId, calendarId)` - Updates an existing calendar event
- `deleteEvent(googleEventId, calendarId)` - Deletes a calendar event

**Token Management:**
- Automatically refreshes expired tokens using the refresh token
- Stores refreshed tokens for future use
- Provides method to retrieve refreshed tokens

#### `server/controllers/calendarCtrl.js`
Handles HTTP requests for calendar-related operations.

**Key Endpoints:**
- `POST /api/calendar/setup` - Initiates calendar setup process
- `GET /api/calendar/auth-url` - Returns Google OAuth URL
- `POST /api/calendar/callback` - Handles OAuth callback and token exchange
- `GET /api/calendar/check-connection` - Checks if user has Google Calendar connected
- `GET /api/calendar/events` - Fetches calendar events
- `GET /api/calendar/user-calendars` - Lists user's available calendars
- `GET /api/calendar/preferred-calendar` - Gets user's preferred calendar
- `POST /api/calendar/preferred-calendar` - Updates user's preferred calendar
- `POST /api/calendar/create-task-event` - Creates calendar event for task
- `POST /api/calendar/update-task-event` - Updates calendar event for task
- `POST /api/calendar/delete-task-event` - Deletes calendar event for task

#### `server/helpers/calendarSyncHelper.js`
Centralized helper for syncing tasks with Google Calendar.

**Key Function:**
- `syncTaskWithCalendar(task, userId, action)` - Syncs task changes with calendar
  - Actions: 'create', 'update', 'delete'
  - Uses user's preferred calendar or falls back to primary calendar
  - Handles token refresh automatically

### 2. Database Models

#### User Model Extensions
Added fields to store Google Calendar integration data:

```javascript
// In server/model.js
googleAccessToken: {
  type: DataTypes.TEXT,
  allowNull: true,
},
googleRefreshToken: {
  type: DataTypes.TEXT,
  allowNull: true,
},
googleTokenExpiry: {
  type: DataTypes.DATE,
  allowNull: true,
},
preferredCalendarId: {
  type: DataTypes.STRING,
  allowNull: true,
},
```

#### Task Model Extensions
Added field to store Google Calendar event ID:

```javascript
googleEventId: {
  type: DataTypes.STRING,
  allowNull: true,
},
```

### 3. Frontend Components

#### `src/Pages/Calendar.jsx`
Main calendar page that displays Google Calendar events.

**Key Features:**
- Checks Google Calendar connection status
- Fetches and displays calendar events
- Handles Google OAuth connection flow
- Manages loading states smoothly
- Retry logic for authentication errors

**State Management:**
- `isLoading` - Shows loader until calendar is fully loaded
- `isGoogleConnected` - Tracks connection status
- `events` - Stores calendar events
- `isCheckingConnection` - Tracks connection verification

#### `src/Pages/Settings.jsx`
Settings page for managing Google Calendar preferences.

**Key Features:**
- Lists all user's Google Calendars
- Allows selection of preferred calendar for task sync
- Saves calendar preference to database
- Shows connection status
- Handles Google OAuth connection

#### `src/Pages/CalendarSetup.jsx`
Onboarding page for initial Google Calendar setup.

**Key Features:**
- Guides users through initial calendar connection
- Explains benefits of calendar integration
- Handles OAuth popup flow
- Redirects to main app after setup

### 4. Authentication Flow

#### Google OAuth 2.0 Setup
1. **Google Cloud Console Configuration:**
   - Create OAuth 2.0 credentials
   - Set authorized redirect URIs
   - Configure OAuth consent screen
   - Add required scopes: `https://www.googleapis.com/auth/calendar`

2. **Environment Variables:**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5050/google-calendar-callback
   ```

#### OAuth Flow Process
1. **Authorization Request:**
   - User clicks "Connect Google Calendar"
   - Frontend calls `GET /api/calendar/auth-url`
   - Backend generates Google OAuth URL
   - Frontend opens OAuth popup

2. **Token Exchange:**
   - User authorizes app in Google popup
   - Google redirects to callback URL with authorization code
   - Backend exchanges code for access/refresh tokens
   - Tokens stored in user's database record

3. **Calendar Access:**
   - Backend uses tokens to access Google Calendar API
   - Automatic token refresh when needed
   - Fresh tokens saved back to database

## Task Synchronization

### How Task Sync Works

1. **Task Creation:**
   - User creates task in CRM
   - `syncTaskWithCalendar()` called with action 'create'
   - Google Calendar event created in user's preferred calendar
   - Task's `googleEventId` updated with event ID

2. **Task Updates:**
   - User modifies task (title, due date, notes, etc.)
   - `syncTaskWithCalendar()` called with action 'update'
   - Google Calendar event updated with new information

3. **Task Deletion:**
   - User deletes task
   - `syncTaskWithCalendar()` called with action 'delete'
   - Google Calendar event removed

### Calendar Selection Logic

The system uses the following priority for calendar selection:

1. **User's Preferred Calendar** - If user has set a preference in Settings
2. **Primary Calendar** - Falls back to user's primary Google Calendar

This is handled in `calendarSyncHelper.js`:

```javascript
let targetCalendarId = null;
if (user.preferredCalendarId) {
  targetCalendarId = user.preferredCalendarId;
} else {
  targetCalendarId = await googleCalendarService.getPrimaryCalendar();
}
```

## Error Handling

### Token Management
- **Automatic Refresh:** Tokens are automatically refreshed when expired
- **Database Updates:** Refreshed tokens are saved back to database
- **Fallback Handling:** If refresh fails, system continues with existing tokens

### API Error Handling
- **401 Unauthorized:** Automatic retry with token refresh
- **403 Forbidden:** Clear error message about permissions
- **404 Not Found:** Calendar not found error
- **Retry Logic:** Progressive delays for failed requests

### Frontend Error Handling
- **Connection Errors:** Retry logic with progressive delays
- **Loading States:** Smooth loading experience without flickering
- **User Feedback:** Clear error messages and success confirmations

## Key Features

### 1. Simplified Calendar Approach
- **No App-Specific Calendars:** Uses user's existing calendars instead of creating dedicated ones
- **Primary Calendar Default:** Falls back to user's primary calendar
- **User Choice:** Users can select their preferred calendar in Settings

### 2. Automatic Token Refresh
- **Seamless Experience:** Users don't need to re-authenticate
- **Background Updates:** Tokens refreshed automatically
- **Database Persistence:** Fresh tokens saved for future use

### 3. Robust Error Handling
- **Retry Logic:** Automatic retries for failed requests
- **Graceful Degradation:** System continues working even if calendar sync fails
- **User Feedback:** Clear error messages and loading states

### 4. Smooth User Experience
- **Single Loading State:** No choppy transitions
- **Progressive Enhancement:** Works without calendar, better with it
- **Intuitive Settings:** Easy calendar preference management

## API Endpoints Reference

### Authentication
- `GET /api/calendar/auth-url` - Get Google OAuth URL
- `POST /api/calendar/callback` - Handle OAuth callback
- `GET /api/calendar/check-connection` - Check connection status

### Calendar Management
- `GET /api/calendar/events` - Fetch calendar events
- `GET /api/calendar/user-calendars` - List user calendars
- `GET /api/calendar/preferred-calendar` - Get preferred calendar
- `POST /api/calendar/preferred-calendar` - Set preferred calendar

### Task Synchronization
- `POST /api/calendar/create-task-event` - Create task event
- `POST /api/calendar/update-task-event` - Update task event
- `POST /api/calendar/delete-task-event` - Delete task event

## Environment Setup

### Required Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5050/google-calendar-callback
```

### Google Cloud Console Setup
1. Create new project or select existing
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Configure OAuth consent screen
5. Add authorized redirect URIs
6. Add test users (for development)

### Database Migration
Run the following to update your database schema:
```bash
npm run initdb
```

This will add the required Google Calendar fields to your User and Task models.

## Troubleshooting

### Common Issues

1. **"Invalid Client" Error:**
   - Check Google Cloud Console OAuth credentials
   - Verify redirect URI matches exactly
   - Ensure OAuth consent screen is configured

2. **"Access Blocked" Error:**
   - Add your email as a test user in OAuth consent screen
   - Verify app is in "Testing" mode, not "Production"

3. **Token Refresh Failures:**
   - Check if refresh token is valid
   - Verify Google Calendar API is enabled
   - Check network connectivity

4. **Calendar Not Found:**
   - Verify user has access to selected calendar
   - Check if calendar ID is correct
   - Ensure calendar exists in user's Google account

### Debug Logging
The system includes comprehensive logging:
- Token refresh operations
- Calendar API calls
- Error conditions
- User actions

Check server logs for detailed debugging information.

## Future Enhancements

### Potential Improvements
1. **Calendar Event Editing:** Allow editing calendar events from the CRM
2. **Bidirectional Sync:** Sync changes from Google Calendar back to CRM
3. **Multiple Calendar Support:** Sync tasks to multiple calendars
4. **Event Categories:** Add task categories that map to calendar event colors
5. **Recurring Tasks:** Support for recurring tasks and events
6. **Calendar Sharing:** Allow sharing task calendars with team members

### Performance Optimizations
1. **Caching:** Cache calendar events for better performance
2. **Batch Operations:** Batch multiple calendar operations
3. **Webhook Integration:** Use Google Calendar webhooks for real-time updates
4. **Background Sync:** Move calendar sync to background jobs

## Conclusion

The Google Calendar integration provides a seamless way for users to sync their CRM tasks with their personal or work calendars. The system is designed to be robust, user-friendly, and maintainable, with comprehensive error handling and automatic token management.

The integration follows Google's best practices for OAuth 2.0 and Calendar API usage, ensuring reliability and security. The modular architecture makes it easy to extend and modify as needed.
