import googleCalendarService from "../services/googleCalendar.js";
import { User, Task, TaskAssignees } from "../model.js";
import { Op } from "sequelize";

// Helper function to sync existing tasks to Google Calendar on first connection
async function syncExistingTasksToCalendar(userId, calendarId, calendar) {
  try {
    console.log(`🔄 Syncing existing tasks to calendar for user ${userId}`);

    // Get all tasks owned by the user
    const ownedTasks = await Task.findAll({
      where: { ownerId: userId },
      attributes: [
        "taskId",
        "title",
        "dueDate",
        "notes",
        "priority",
        "status",
        "googleEventId",
      ],
    });

    // Get all tasks assigned to the user using the proper association
    const assignedTaskIds = await TaskAssignees.findAll({
      where: { userId },
      attributes: ["taskId"],
    });

    const assignedTasks =
      assignedTaskIds.length > 0
        ? await Task.findAll({
            where: {
              taskId: assignedTaskIds.map((assignment) => assignment.taskId),
              status: {
                [Op.not]: "completed",
              },
            },
            attributes: [
              "taskId",
              "title",
              "dueDate",
              "notes",
              "priority",
              "status",
              "googleEventId",
            ],
          })
        : [];

    // Combine owned and assigned tasks, removing duplicates
    const allUserTasks = [
      ...ownedTasks,
      ...assignedTasks.filter(
        (task) => !ownedTasks.some((owned) => owned.taskId === task.taskId)
      ),
    ];

    console.log(
      `📋 Found ${allUserTasks.length} tasks to sync for user ${userId}`
    );
    console.log(`   - Owned tasks: ${ownedTasks.length}`);
    console.log(`   - Assigned tasks: ${assignedTasks.length}`);
    console.log(
      `   - Tasks already synced: ${
        allUserTasks.filter((t) => t.googleEventId).length
      }`
    );

    let syncedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const task of allUserTasks) {
      try {
        // Skip tasks that already have Google Calendar events
        if (task.googleEventId) {
          console.log(`⏭️ Skipping task "${task.title}" - already synced`);
          skippedCount++;
          continue;
        }

        // Create new event in the calendar - pass calendar instance
        const eventResponse = await googleCalendarService.createEventFromTask(
          calendar,
          task,
          calendarId
        );

        // Update task with new event ID
        await task.update({ googleEventId: eventResponse.id });

        console.log(`✅ Synced task "${task.title}" to calendar`);
        syncedCount++;
      } catch (taskError) {
        console.error(
          `❌ Failed to sync task "${task.title}":`,
          taskError.message
        );
        errorCount++;
      }
    }

    console.log(
      `🎉 Initial sync complete: ${syncedCount} tasks synced, ${skippedCount} already synced, ${errorCount} errors`
    );
    return { syncedCount, errorCount, skippedCount };
  } catch (error) {
    console.error("❌ Error during initial task sync:", error);
    throw error;
  }
}

// Helper function to migrate user's tasks to a new calendar
async function migrateUserTasksToNewCalendar(
  userId,
  oldCalendarId,
  newCalendarId,
  calendar
) {
  try {
    // Get all tasks assigned to the user (regardless of ownership)
    const assignedTaskIds = await TaskAssignees.findAll({
      where: { userId },
      attributes: ["taskId"],
    });

    const assignedTasks =
      assignedTaskIds.length > 0
        ? await Task.findAll({
            where: {
              taskId: assignedTaskIds.map((assignment) => assignment.taskId),
              status: {
                [Op.not]: "completed",
              },
            },
            attributes: [
              "taskId",
              "title",
              "dueDate",
              "notes",
              "priority",
              "status",
              "googleEventId",
            ],
          })
        : [];

    console.log(
      `📋 Found ${assignedTasks.length} assigned tasks to migrate for user ${userId}`
    );
    console.log(
      `   - Tasks with calendar events: ${
        assignedTasks.filter((t) => t.googleEventId).length
      }`
    );

    let migratedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const task of assignedTasks) {
      try {
        // Skip tasks without Google Calendar events
        if (!task.googleEventId) {
          console.log(`⏭️ Skipping task "${task.title}" - no calendar event`);
          skippedCount++;
          continue;
        }

        // Delete the old event from the old calendar
        if (task.googleEventId) {
          let deletedFromOldCalendar = false;

          // Try to delete from the old preferred calendar first
          if (oldCalendarId) {
            console.log(
              `🗑️ Attempting to delete event ${task.googleEventId} from calendar ${oldCalendarId} for task "${task.title}"`
            );
            try {
              await googleCalendarService.deleteEvent(
                calendar,
                task.googleEventId,
                oldCalendarId
              );
              console.log(
                `✅ Successfully deleted old event for task "${task.title}" from calendar ${oldCalendarId}`
              );
              deletedFromOldCalendar = true;
            } catch (deleteError) {
              // Handle different types of deletion errors
              if (deleteError.code === 404) {
                console.log(
                  `ℹ️ Event for task "${task.title}" not found in old calendar ${oldCalendarId}`
                );
              } else {
                console.warn(
                  `⚠️ Failed to delete old event for task "${task.title}" from calendar ${oldCalendarId}:`,
                  deleteError.message
                );
              }
            }
          }

          // If deletion from old calendar failed and we have an oldCalendarId, try deleting from primary calendar as fallback
          if (!deletedFromOldCalendar && oldCalendarId) {
            console.log(
              `🔄 Trying to delete from primary calendar as fallback for task "${task.title}"`
            );
            try {
              await googleCalendarService.deleteEvent(
                calendar,
                task.googleEventId,
                "primary"
              );
              console.log(
                `✅ Successfully deleted event from primary calendar for task "${task.title}"`
              );
            } catch (primaryDeleteError) {
              if (primaryDeleteError.code === 404) {
                console.log(
                  `ℹ️ Event for task "${task.title}" not found in primary calendar either`
                );
              } else {
                console.warn(
                  `⚠️ Failed to delete event from primary calendar for task "${task.title}":`,
                  primaryDeleteError.message
                );
              }
            }
          }
        } else {
          console.log(
            `ℹ️ Skipping deletion for task "${task.title}" - no googleEventId`
          );
        }

        // Create new event in the new calendar
        const newEventResponse =
          await googleCalendarService.createEventFromTask(calendar, task, newCalendarId);

        // Update task with new event ID (extract ID from response)
        await task.update({ googleEventId: newEventResponse.id });

        console.log(
          `✅ Migrated task "${task.title}" to calendar ${newCalendarId}`
        );
        migratedCount++;
      } catch (taskError) {
        console.error(
          `❌ Failed to migrate task "${task.title}":`,
          taskError.message
        );
        errorCount++;
      }
    }

    console.log(
      `🎉 Migration complete: ${migratedCount} tasks migrated, ${skippedCount} skipped, ${errorCount} errors`
    );
    return { migratedCount, errorCount, skippedCount };
  } catch (error) {
    console.error("❌ Error during task migration:", error);
    throw error;
  }
}

export { syncExistingTasksToCalendar };

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
        authUrl: authUrl,
      });
    } catch (error) {
      console.error("❌ Calendar setup error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to set up calendar",
      });
    }
  },

  getAuthUrl: async (req, res) => {
    try {
      const userId = req.session.user?.userId;
      const authUrl = googleCalendarService.getAuthUrl(userId);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error getting auth URL:", error);
      res.status(500).json({ message: "Error getting authorization URL" });
    }
  },

  handleCallback: async (req, res) => {
    try {
      const { code, userId } = req.body;

      // Use userId from request body (popup) or session (direct access)
      const targetUserId = userId || req.session.user?.userId;

      if (!targetUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const tokens = await googleCalendarService.getTokens(code);

      await User.update(
        {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: new Date(tokens.expiry_date),
        },
        { where: { userId: targetUserId } }
      );

      // Initialize calendar service with new tokens - returns calendar instance
      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        tokens.access_token,
        tokens.refresh_token
      );

      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize Google Calendar" });
      }

      // Update user with refreshed tokens if available
      if (refreshedTokens) {
        await User.update(
          {
            googleAccessToken: refreshedTokens.access_token,
            googleRefreshToken: refreshedTokens.refresh_token,
            googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null,
          },
          { where: { userId: targetUserId } }
        );
      }

      // Get user's preferred calendar (or default to primary)
      const user = await User.findByPk(targetUserId);
      const targetCalendarId = user.preferredCalendarId || "primary";

      // Sync existing tasks to Google Calendar
      let syncResult = null;
      try {
        console.log(`🔄 Starting initial sync for user ${targetUserId}`);
        syncResult = await syncExistingTasksToCalendar(
          targetUserId,
          targetCalendarId,
          calendar
        );
        console.log(`✅ Initial sync completed:`, syncResult);
      } catch (syncError) {
        console.error("❌ Initial sync failed:", syncError);
        // Don't fail the entire connection if sync fails
        syncResult = { error: syncError.message };
      }

      res.json({
        message: "Google Calendar connected successfully",
        sync: syncResult,
      });
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

      console.log(`👤 User found: ${user.username || user.email || "Unknown"}`);
      console.log(
        `🔑 Google tokens: accessToken=${!!user.googleAccessToken}, refreshToken=${!!user.googleRefreshToken}`
      );

      if (!user.googleAccessToken) {
        console.log(
          `❌ User ${userId} does not have Google Calendar connected`
        );
        return res
          .status(400)
          .json({ message: "Google Calendar not connected" });
      }

      console.log(`🔧 Initializing calendar service for user ${userId}`);
      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );

      if (!calendar) {
        return res.status(500).json({
          message: "Failed to initialize Google Calendar service",
        });
      }

      // Update tokens if refreshed
      if (refreshedTokens) {
        console.log("💾 Updating user tokens in database");
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date
            ? new Date(refreshedTokens.expiry_date)
            : null,
        });
      }

      // Determine which calendar to use for fetching events
      let targetCalendarId = null;
      if (user.preferredCalendarId) {
        targetCalendarId = user.preferredCalendarId;
        console.log(
          `📅 Fetching events from preferred calendar: ${targetCalendarId}`
        );
      } else {
        targetCalendarId = await googleCalendarService.getPrimaryCalendar(calendar);
        console.log(
          `📅 Fetching events from primary calendar: ${targetCalendarId}`
        );
      }

      console.log(
        `📅 Fetching events with timeMin: ${timeMin || "none"}, timeMax: ${
          timeMax || "none"
        }`
      );
      const events = await googleCalendarService.getEvents(
        calendar,
        timeMin,
        timeMax,
        targetCalendarId
      );

      console.log(`✅ Found ${events.length} events`);
      res.json({ events });
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      res.status(500).json({
        message: "Error fetching events",
        error: error.message,
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
      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      const googleEvent = await googleCalendarService.createEventFromTask(calendar, task);

      res.json({
        message: "Calendar event created successfully",
        googleEventId: googleEvent.id,
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

      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      const googleEvent = await googleCalendarService.updateEventFromTask(
        calendar,
        task,
        googleEventId
      );

      res.json({
        message: "Calendar event updated successfully",
        googleEvent,
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

      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      await googleCalendarService.deleteEvent(calendar, googleEventId, calendarId);

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

      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      const calendarId = await googleCalendarService.getPrimaryCalendar(calendar);

      res.json({
        message: "App calendar ready",
        calendarId: calendarId,
        calendarName: "CLG CMS Tasks",
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

      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      const calendars = await calendar.calendarList.list();
      const calendarList = calendars.data.items.map((cal) => ({
        id: cal.id,
        name: cal.summary,
        description: cal.description || "",
        primary: cal.primary || false,
        accessRole: cal.accessRole,
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
        preferredCalendarId: user.preferredCalendarId || null,
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

      const oldCalendarId = user.preferredCalendarId;

      console.log(`🔄 Calendar migration: ${oldCalendarId} → ${calendarId}`);

      // Update user's preferred calendar
      await user.update({ preferredCalendarId: calendarId });

      // Initialize calendar service with user's tokens
      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }
      
     

      // Migrate existing tasks if calendar changed
      let migrationResult = null;
      if (oldCalendarId && oldCalendarId !== calendarId) {
        console.log(
          `🔄 Migrating tasks from ${oldCalendarId} to ${calendarId}`
        );
        try {
          migrationResult = await migrateUserTasksToNewCalendar(
            userId,
            oldCalendarId,
            calendarId,
            calendar
          );
        } catch (migrationError) {
          console.error("❌ Migration failed:", migrationError);
          // Don't fail the entire operation if migration fails
          migrationResult = { error: migrationError.message };
        }
      }

      res.json({
        message: "Preferred calendar updated successfully",
        preferredCalendarId: calendarId,
        migration: migrationResult,
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

      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );
      
      if (!calendar) {
        return res.status(500).json({ message: "Failed to initialize calendar" });
      }
      
      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null
        });
      }

      // Get primary calendar info
      const primaryCalendarId =
        await googleCalendarService.getPrimaryCalendar(calendar);

      // Get calendar details
      const calendars = await calendar.calendarList.list();
      const primaryCalendar = calendars.data.items.find(
        (cal) => cal.id === primaryCalendarId
      );

      res.json({
        primaryCalendar: {
          id: primaryCalendar.id,
          summary: primaryCalendar.summary,
          description: primaryCalendar.description,
          primary: primaryCalendar.primary,
        },
        message: "Using primary calendar for task sync",
      });
    } catch (error) {
      console.error("Error getting primary calendar info:", error);
      res.status(500).json({
        message: "Error getting calendar info",
        error: error.message,
      });
    }
  },

  // Disconnect Google Calendar
  disconnectCalendar: async (req, res) => {
    try {
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Clear all Google Calendar-related data
      await user.update({
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        preferredCalendarId: null,
      });

      console.log(`✅ Google Calendar disconnected for user ${userId}`);

      res.json({
        message: "Google Calendar disconnected successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      res.status(500).json({
        message: "Error disconnecting calendar",
        error: error.message,
      });
    }
  },

  // Manual sync of all user tasks to Google Calendar
  syncAllTasks: async (req, res) => {
    try {
      const { userId } = req.session.user;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.googleAccessToken) {
        return res.status(400).json({ 
          message: "Google Calendar not connected",
          success: false 
        });
      }

      console.log(`🔄 Manual sync requested for user ${userId}`);

      // Initialize calendar service
      const { calendar, refreshedTokens } = await googleCalendarService.initializeCalendar(
        user.googleAccessToken,
        user.googleRefreshToken
      );

      if (!calendar) {
        return res.status(500).json({ 
          message: "Failed to initialize Google Calendar",
          success: false 
        });
      }

      // Update tokens if refreshed
      if (refreshedTokens) {
        await user.update({
          googleAccessToken: refreshedTokens.access_token,
          googleRefreshToken: refreshedTokens.refresh_token,
          googleTokenExpiry: refreshedTokens.expiry_date ? new Date(refreshedTokens.expiry_date) : null,
        });
      }

      // Get user's preferred calendar
      const targetCalendarId = user.preferredCalendarId || "primary";

      // Sync all tasks
      const syncResult = await syncExistingTasksToCalendar(
        userId,
        targetCalendarId,
        calendar
      );

      console.log(`✅ Manual sync completed for user ${userId}:`, syncResult);

      res.json({
        message: "Tasks synced successfully",
        success: true,
        ...syncResult,
      });
    } catch (error) {
      console.error("Error syncing tasks:", error);
      res.status(500).json({
        message: "Error syncing tasks to calendar",
        error: error.message,
        success: false,
      });
    }
  },
};
