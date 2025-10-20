import { Notification, User, Task } from "../model.js";

/**
 * Notification Helper
 * Handles creating and managing notifications for task-related actions
 */

// Notification types for tasks and cases
export const NOTIFICATION_TYPES = {
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_DELETED: "task_deleted",
  TASK_ASSIGNED: "task_assigned",
  TASK_UNASSIGNED: "task_unassigned",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_DUE_DATE_CHANGED: "task_due_date_changed",
  TASK_PRIORITY_CHANGED: "task_priority_changed",
  TASK_CASE_CHANGED: "task_case_changed",
  CASE_CREATED: "case_created",
  CASE_UPDATED: "case_updated",
  CASE_ARCHIVED: "case_archived",
  CASE_UNARCHIVED: "case_unarchived",
  CASE_ASSIGNED: "case_assigned",
  CASE_UNASSIGNED: "case_unassigned",
  CASE_PHASE_CHANGED: "case_phase_changed",
  CASE_PRIORITY_CHANGED: "case_priority_changed",
  COMMENT_ADDED: "comment_added",
};

/**
 * Create a notification for a specific user
 * @param {number} userId - The user to notify
 * @param {string} type - The notification type
 * @param {string} objectType - 'task' or 'case'
 * @param {number} objectId - The ID of the task or case
 * @param {string} message - The notification message
 * @returns {Promise<Notification>}
 */
export const createNotification = async (
  userId,
  type,
  objectType,
  objectId,
  message
) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      objectType,
      objectId,
      message,
      isRead: false,
    });

    console.log(`📢 Created notification for user ${userId}: ${message}`);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get users who should be notified for a task action
 * @param {number} taskId - The task ID
 * @param {string} action - The action being performed
 * @param {number} actorId - The user performing the action
 * @returns {Promise<Array>} Array of user objects to notify
 */
export const getTaskNotificationRecipients = async (
  taskId,
  action,
  actorId
) => {
  try {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["userId", "username", "firstName", "lastName"],
        },
      ],
    });

    if (!task) {
      console.warn(`Task ${taskId} not found for notifications`);
      return [];
    }

    // Get all task assignees using the proper association
    const assigneeUsers = await task.getAssignees({
      attributes: ["userId", "username", "firstName", "lastName"],
    });
    const recipients = [];

    // Add task owner (if not the actor)
    if (task.ownerId && task.ownerId !== actorId) {
      recipients.push({
        userId: task.ownerId,
        username: task.owner.username,
        firstName: task.owner.firstName,
        lastName: task.owner.lastName,
        isOwner: true,
      });
    }

    // Add assignees (if not the actor and not already added as owner)
    assigneeUsers.forEach((assignee) => {
      if (
        assignee.userId !== actorId &&
        !recipients.find((r) => r.userId === assignee.userId)
      ) {
        recipients.push({
          userId: assignee.userId,
          username: assignee.username,
          firstName: assignee.firstName,
          lastName: assignee.lastName,
          isOwner: false,
        });
      }
    });

    console.log(
      `📋 Found ${recipients.length} notification recipients for task ${taskId}`
    );
    return recipients;
  } catch (error) {
    console.error("Error getting task notification recipients:", error);
    return [];
  }
};

/**
 * Create notifications for task creation
 * @param {Object} task - The created task
 * @param {number} actorId - The user who created the task
 * @param {string} actorName - The name of the user who created the task
 */
export const notifyTaskCreated = async (task, actorId, actorName) => {
  try {
    const recipients = await getTaskNotificationRecipients(
      task.taskId,
      "created",
      actorId
    );

    for (const recipient of recipients) {
      // Task owners get notified of everything
      if (recipient.isOwner) {
        await createNotification(
          recipient.userId,
          NOTIFICATION_TYPES.TASK_CREATED,
          "task",
          task.taskId,
          `${actorName} created a new task: "${task.title}"`
        );
      }
      // Assignees do NOT get notified for task creation
      // They only get notifications when they are specifically assigned (handled in addTaskAssignee)
    }
  } catch (error) {
    console.error("Error creating task creation notifications:", error);
  }
};

/**
 * Create notifications for task updates
 * @param {Object} task - The updated task
 * @param {number} actorId - The user who updated the task
 * @param {string} actorName - The name of the user who updated the task
 * @param {string} fieldName - The field that was updated
 * @param {string} oldValue - The old value
 * @param {string} newValue - The new value
 */
export const notifyTaskUpdated = async (
  task,
  actorId,
  actorName,
  fieldName,
  oldValue,
  newValue
) => {
  console.log("notify Task Updated");
  try {
    // Skip notifications for notes updates
    if (fieldName === "notes") {
      console.log("Skipping notification for notes update");
      return;
    }

    const recipients = await getTaskNotificationRecipients(
      task.taskId,
      "updated",
      actorId
    );

    let message = "";
    let notificationType = NOTIFICATION_TYPES.TASK_UPDATED;

    // Create specific messages based on the field updated
    switch (fieldName) {
      case "status":
        message = `${actorName} changed the status to ${newValue}`;
        notificationType = NOTIFICATION_TYPES.TASK_STATUS_CHANGED;
        break;
      case "dueDate":
        message = `${actorName} changed the due date to ${new Date(
          newValue
        ).toLocaleDateString()}`;
        notificationType = NOTIFICATION_TYPES.TASK_DUE_DATE_CHANGED;
        break;
      case "priority":
        message = `${actorName} changed the priority to ${newValue}`;
        notificationType = NOTIFICATION_TYPES.TASK_PRIORITY_CHANGED;
        break;
      case "caseId":
        message = `${actorName} moved the task to a different case`;
        notificationType = NOTIFICATION_TYPES.TASK_CASE_CHANGED;
        break;
      case "title":
        message = `${actorName} updated the title to "${newValue}"`;
        break;
      default:
        message = `${actorName} updated "${task.title}"`;
    }

    for (const recipient of recipients) {
      // Task owners get notified of everything (except notes)
      if (recipient.isOwner) {
        await createNotification(
          recipient.userId,
          notificationType,
          "task",
          task.taskId,
          message
        );
      }
      // Assignees do NOT get notified for general task updates
      // They only get notifications for assignment/unassignment (handled elsewhere)
    }
  } catch (error) {
    console.error("Error creating task update notifications:", error);
  }
};

/**
 * Create notifications for task deletion
 * @param {Object} task - The deleted task
 * @param {number} actorId - The user who deleted the task
 * @param {string} actorName - The name of the user who deleted the task
 */
export const notifyTaskDeleted = async (task, actorId, actorName) => {
  try {
    const recipients = await getTaskNotificationRecipients(
      task.taskId,
      "deleted",
      actorId
    );

    for (const recipient of recipients) {
      // Task owners get notified of everything
      if (recipient.isOwner) {
        await createNotification(
          recipient.userId,
          NOTIFICATION_TYPES.TASK_DELETED,
          "task",
          task.taskId,
          `${actorName} deleted the task: "${task.title}"`
        );
      }
      // Assignees do NOT get notified for task deletion
      // They only get notifications for assignment/unassignment
    }
  } catch (error) {
    console.error("Error creating task deletion notifications:", error);
  }
};

/**
 * Create notifications for task assignment
 * @param {Object} task - The task being assigned
 * @param {number} assigneeId - The user being assigned
 * @param {string} assigneeName - The name of the user being assigned
 * @param {number} actorId - The user who assigned the task
 * @param {string} actorName - The name of the user who assigned the task
 */
export const notifyTaskAssigned = async (
  task,
  assigneeId,
  assigneeName,
  actorId,
  actorName
) => {
  try {
    // Notify the assignee
    await createNotification(
      assigneeId,
      NOTIFICATION_TYPES.TASK_ASSIGNED,
      "task",
      task.taskId,
      `${actorName} assigned this task to you`
    );

    // Notify the task owner (if different from actor)
    if (task.ownerId && task.ownerId !== actorId) {
      await createNotification(
        task.ownerId,
        NOTIFICATION_TYPES.TASK_ASSIGNED,
        "task",
        task.taskId,
        `${actorName} assigned ${assigneeName} to your task`
      );
    }
  } catch (error) {
    console.error("Error creating task assignment notifications:", error);
  }
};

/**
 * Create notifications for task unassignment
 * @param {Object} task - The task being unassigned
 * @param {number} unassignedUserId - The user being unassigned
 * @param {string} unassignedUserName - The name of the user being unassigned
 * @param {number} actorId - The user who unassigned the task
 * @param {string} actorName - The name of the user who unassigned the task
 */
export const notifyTaskUnassigned = async (
  task,
  unassignedUserId,
  unassignedUserName,
  actorId,
  actorName
) => {
  try {
    // Notify the unassigned user
    await createNotification(
      unassignedUserId,
      NOTIFICATION_TYPES.TASK_UNASSIGNED,
      "task",
      task.taskId,
      `${actorName} removed you from this task`
    );

    // Notify the task owner (if different from actor)
    if (task.ownerId && task.ownerId !== actorId) {
      await createNotification(
        task.ownerId,
        NOTIFICATION_TYPES.TASK_UNASSIGNED,
        "task",
        task.taskId,
        `${actorName} removed ${unassignedUserName}`
      );
    }
  } catch (error) {
    console.error("Error creating task unassignment notifications:", error);
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - The notification ID
 * @param {number} userId - The user ID (for security)
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          notificationId,
          userId, // Ensure user can only mark their own notifications as read
        },
      }
    );

    console.log(
      `📖 Marked notification ${notificationId} as read for user ${userId}`
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - The notification ID
 * @param {number} userId - The user ID (for security)
 */
export const markNotificationAsCleared = async (notificationId, userId) => {
  try {
    await Notification.update(
      { isCleared: true },
      {
        where: {
          notificationId,
          userId, // Ensure user can only mark their own notifications as read
        },
      }
    );

    console.log(
      `📖 Marked notification ${notificationId} as cleared for user ${userId}`
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {number} userId - The user ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

/**
 * Get users who should be notified for a case action
 * @param {number} caseId - The case ID
 * @param {number} actorId - The user performing the action
 * @returns {Promise<Array>} Array of user objects to notify
 */
export const getCaseNotificationRecipients = async (caseId, actorId) => {
  try {
    const { Case, CaseAssignees, User } = await import("../model.js");

    const theCase = await Case.findByPk(caseId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["userId", "username", "firstName", "lastName"],
        },
      ],
    });

    if (!theCase) {
      console.warn(`Case ${caseId} not found for notifications`);
      return [];
    }

    // Get all case assignees using the proper association method
    const assignedUsers = await theCase.getAssignees({
      attributes: ["userId", "username", "firstName", "lastName"],
    });

    const recipients = [];

    // Add case owner (if not the actor)
    if (theCase.ownerId && theCase.ownerId !== actorId) {
      recipients.push({
        userId: theCase.ownerId,
        username: theCase.owner.username,
        firstName: theCase.owner.firstName,
        lastName: theCase.owner.lastName,
        isOwner: true,
      });
    }

    // Add assignees (if not the actor and not already added as owner)
    assignedUsers.forEach((user) => {
      if (
        user.userId !== actorId &&
        !recipients.find((r) => r.userId === user.userId)
      ) {
        recipients.push({
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isOwner: false,
        });
      }
    });

    console.log(
      `📋 Found ${recipients.length} notification recipients for case ${caseId}`
    );
    return recipients;
  } catch (error) {
    console.error("Error getting case notification recipients:", error);
    return [];
  }
};

/**
 * Create notifications for case creation
 * @param {Object} theCase - The created case
 * @param {number} actorId - The user who created the case
 * @param {string} actorName - The name of the user who created the case
 */
export const notifyCaseCreated = async (theCase, actorId, actorName) => {
  try {
    console.log(
      `🔔 Creating case creation notifications for case ${theCase.caseId}`
    );
    const recipients = await getCaseNotificationRecipients(
      theCase.caseId,
      actorId
    );

    console.log(`📋 Found ${recipients.length} recipients for case creation`);

    for (const recipient of recipients) {
      // Case owners get notified of everything
      if (recipient.isOwner) {
        await createNotification(
          recipient.userId,
          NOTIFICATION_TYPES.CASE_CREATED,
          "case",
          theCase.caseId,
          `${actorName} created a new case: "${theCase.title}"`
        );
        console.log(
          `📢 Notified case owner ${recipient.userId} of case creation`
        );
      }
      // Assignees only get notified if they're assigned (which they would be for new cases)
      else {
        await createNotification(
          recipient.userId,
          NOTIFICATION_TYPES.CASE_ASSIGNED,
          "case",
          theCase.caseId,
          `${actorName} assigned this case to you`
        );
        console.log(
          `📢 Notified assignee ${recipient.userId} of case assignment`
        );
      }
    }
  } catch (error) {
    console.error("Error creating case creation notifications:", error);
  }
};

/**
 * Create notifications for case updates
 * @param {Object} theCase - The updated case
 * @param {number} actorId - The user who updated the case
 * @param {string} actorName - The name of the user who updated the case
 * @param {string} fieldName - The field that was updated
 * @param {string} oldValue - The old value
 * @param {string} newValue - The new value
 */
export const notifyCaseUpdated = async (
  theCase,
  actorId,
  actorName,
  fieldName,
  oldValue,
  newValue
) => {
  try {
    const recipients = await getCaseNotificationRecipients(
      theCase.caseId,
      actorId
    );

    let message = "";
    let notificationType = NOTIFICATION_TYPES.CASE_UPDATED;

    // Create specific messages based on the field updated
    switch (fieldName) {
      case "phase":
        message = `${actorName} changed the phase to ${newValue}`;
        notificationType = NOTIFICATION_TYPES.CASE_PHASE_CHANGED;
        break;
      case "priority":
        message = `${actorName} changed the priority to ${newValue}`;
        notificationType = NOTIFICATION_TYPES.CASE_PRIORITY_CHANGED;
        break;
      case "title":
        message = `${actorName} updated the title to "${newValue}"`;
        break;
      case "clientName":
        message = `${actorName} updated the client name to "${newValue}"`;
        break;
      default:
        message = `${actorName} updated "${theCase.title}"`;
    }

    for (const recipient of recipients) {
      // Case owners get notified of everything (except notes)
      if (recipient.isOwner) {
        await createNotification(
          recipient.userId,
          notificationType,
          "case",
          theCase.caseId,
          message
        );
      }
      // Non-owners only get notified if they're assigned to the case
      else {
        await createNotification(
          recipient.userId,
          notificationType,
          "case",
          theCase.caseId,
          message
        );
      }
    }
  } catch (error) {
    console.error("Error creating case update notifications:", error);
  }
};

/**
 * Create notifications for case archiving/unarchiving
 * @param {Object} theCase - The case being archived/unarchived
 * @param {number} actorId - The user who archived/unarchived the case
 * @param {string} actorName - The name of the user who archived/unarchived the case
 * @param {boolean} isArchived - Whether the case is being archived or unarchived
 */
export const notifyCaseArchiveStatus = async (
  theCase,
  actorId,
  actorName,
  isArchived
) => {
  try {
    const recipients = await getCaseNotificationRecipients(
      theCase.caseId,
      actorId
    );

    const notificationType = isArchived
      ? NOTIFICATION_TYPES.CASE_ARCHIVED
      : NOTIFICATION_TYPES.CASE_UNARCHIVED;
    const action = isArchived ? "archived" : "unarchived";
    const message = `${actorName} ${action} the case: "${theCase.title}"`;

    for (const recipient of recipients) {
      await createNotification(
        recipient.userId,
        notificationType,
        "case",
        theCase.caseId,
        message
      );
    }
  } catch (error) {
    console.error("Error creating case archive notifications:", error);
  }
};

/**
 * Create notifications for case assignment
 * @param {Object} theCase - The case being assigned
 * @param {number} assigneeId - The user being assigned
 * @param {string} assigneeName - The name of the user being assigned
 * @param {number} actorId - The user who assigned the case
 * @param {string} actorName - The name of the user who assigned the case
 */
export const notifyCaseAssigned = async (
  theCase,
  assigneeId,
  assigneeName,
  actorId,
  actorName
) => {
  try {
    // Notify the assignee
    await createNotification(
      assigneeId,
      NOTIFICATION_TYPES.CASE_ASSIGNED,
      "case",
      theCase.caseId,
      `${actorName} assigned this case to you`
    );

    // Notify the case owner (if different from actor)
    if (theCase.ownerId && theCase.ownerId !== actorId) {
      await createNotification(
        theCase.ownerId,
        NOTIFICATION_TYPES.CASE_ASSIGNED,
        "case",
        theCase.caseId,
        `${actorName} assigned ${assigneeName} to your case`
      );
    }
  } catch (error) {
    console.error("Error creating case assignment notifications:", error);
  }
};

/**
 * Create notifications for case unassignment
 * @param {Object} theCase - The case being unassigned
 * @param {number} unassignedUserId - The user being unassigned
 * @param {string} unassignedUserName - The name of the user being unassigned
 * @param {number} actorId - The user who unassigned the case
 * @param {string} actorName - The name of the user who unassigned the case
 */
export const notifyCaseUnassigned = async (
  theCase,
  unassignedUserId,
  unassignedUserName,
  actorId,
  actorName
) => {
  try {
    // Notify the unassigned user
    await createNotification(
      unassignedUserId,
      NOTIFICATION_TYPES.CASE_UNASSIGNED,
      "case",
      theCase.caseId,
      `${actorName} removed you from this case`
    );

    // Notify the case owner (if different from actor)
    if (theCase.ownerId && theCase.ownerId !== actorId) {
      await createNotification(
        theCase.ownerId,
        NOTIFICATION_TYPES.CASE_UNASSIGNED,
        "case",
        theCase.caseId,
        `${actorName} removed ${unassignedUserName} from your case`
      );
    }
  } catch (error) {
    console.error("Error creating case unassignment notifications:", error);
  }
};

/**
 * Create notifications for comment creation
 * @param {Object} object - Case or Task object
 * @param {number} actorId - The user who created the comment
 * @param {string} actorName - The name of the user who created the comment
 */
export const notifyCommentCreated = async ({ object, actorId, actorName }) => {
  try {
    console.log(
      `🔔 Creating comment creation notifications for ${object.objectType} ${object.objectId}`
    );

    let recipients;

    if (object.objectType === "case") {
      console.log("case");
      recipients = await getCaseNotificationRecipients(
        object.objectId,
        actorId
      );
    } else
      recipients = await getTaskNotificationRecipients(
        object.objectId,
        actorId
      );

    console.log(
      `📋 Found ${recipients.length} recipients for comment creation`
    );

    for (const recipient of recipients) {
      if (recipient.userId === actorId) {
        return;
      }
      // Everyone gets notified of every comment
      else
        await createNotification(
          recipient.userId,
          NOTIFICATION_TYPES.COMMENT_ADDED,
          object.objectType,
          object.objectId,
          `${actorName} added a new comment "${object.content}"`
        );
      console.log(`📢 Notified owner ${recipient.userId} of comment creation`);
    }
  } catch (error) {
    console.error("Error creating comment creation notifications:", error);
  }
};
