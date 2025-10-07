import { User, Task } from '../model.js';
import googleCalendarService from '../services/googleCalendar.js';

// Helper function to sync a task with Google Calendar
export const syncTaskWithCalendar = async (task, userId, action) => {
  try {
    // Only sync if user has Google Calendar connected
    const user = await User.findByPk(userId);
    if (!user.googleAccessToken) {
      console.log("User doesn't have Google Calendar connected, skipping sync");
      return;
    }

    // Initialize calendar service - returns calendar instance
    const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
      user.googleAccessToken,
      user.googleRefreshToken
    );
    
    if (!calendar) {
      console.error("Failed to initialize calendar service for task sync");
      return;
    }

    // Update tokens if refreshed
    if (refreshedTokens) {
      console.log("💾 Updating user tokens in database (task sync)");
      await user.update({
        googleAccessToken: refreshedTokens.access_token,
        googleRefreshToken: refreshedTokens.refresh_token,
        googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
      });
    }

    // Determine which calendar to use
    let targetCalendarId = null;
    if (user.preferredCalendarId) {
      targetCalendarId = user.preferredCalendarId;
      console.log(`Using user's preferred calendar: ${targetCalendarId}`);
    } else {
      // Fall back to primary calendar if no preference is set
      targetCalendarId = await googleCalendarService.getPrimaryCalendar(calendar);
      console.log(`Using primary calendar: ${targetCalendarId}`);
    }

    switch (action) {
      case 'create':
        // Create calendar event for new task - pass calendar instance
        const googleEvent = await googleCalendarService.createEventFromTask(calendar, task, targetCalendarId);
        
        // Update task with googleEventId
        await task.update({ googleEventId: googleEvent.id });
        
        console.log(`Created calendar event for task: ${task.title}`);
        break;

      case 'update':
        // Update calendar event if task has googleEventId
        if (task.googleEventId) {
          await googleCalendarService.updateEventFromTask(calendar, task, task.googleEventId, targetCalendarId);
          console.log(`Updated calendar event for task: ${task.title}`);
        }
        break;

      case 'delete':
        // Delete calendar event if task has googleEventId
        if (task.googleEventId) {
          await googleCalendarService.deleteEvent(calendar, task.googleEventId, targetCalendarId);
          console.log(`Deleted calendar event for task: ${task.title}`);
        }
        break;

      default:
        console.log(`Unknown sync action: ${action}`);
    }
  } catch (error) {
    console.error(`Error syncing task with calendar (${action}):`, error);
    // Don't throw error - calendar sync shouldn't break task operations
  }
};
