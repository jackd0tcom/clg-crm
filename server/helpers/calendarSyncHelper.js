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

    // Initialize calendar service
    await googleCalendarService.initializeCalendar(
      user.googleAccessToken,
      user.googleRefreshToken
    );

    // Determine which calendar to use
    // Use primary calendar (simplified approach)
    const targetCalendarId = await googleCalendarService.getPrimaryCalendar();
    console.log(`Using primary calendar: ${targetCalendarId}`);

    switch (action) {
      case 'create':
        // Create calendar event for new task
        const googleEvent = await googleCalendarService.createEventFromTask(task, targetCalendarId);
        
        // Update task with googleEventId
        await task.update({ googleEventId: googleEvent.id });
        
        console.log(`Created calendar event for task: ${task.title}`);
        break;

      case 'update':
        // Update calendar event if task has googleEventId
        if (task.googleEventId) {
          await googleCalendarService.updateEventFromTask(task, task.googleEventId, targetCalendarId);
          console.log(`Updated calendar event for task: ${task.title}`);
        }
        break;

      case 'delete':
        // Delete calendar event if task has googleEventId
        if (task.googleEventId) {
          await googleCalendarService.deleteEvent(task.googleEventId, targetCalendarId);
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
