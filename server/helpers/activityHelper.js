import {
  ActivityLog,
  ActivityReaders,
  CaseAssignees,
  TaskAssignees,
} from "../model.js";

/**
 * Creates an activity log entry with appropriate readers
 * @param {Object} params - Activity parameters
 * @param {number} params.authorId - User who performed the action
 * @param {string} params.objectType - Type of object ('case', 'task', 'comment')
 * @param {number} params.objectId - ID of the object
 * @param {string} params.action - Action performed
 * @param {string} params.details - Additional details
 * @param {Array} params.customReaderIds - Optional custom reader IDs
 */
export async function createActivityLog({
  authorId,
  objectType,
  objectId,
  action,
  details,
  customReaderIds = null,
}) {
  try {
    // Create the activity log entry
    const activity = await ActivityLog.create({
      authorId,
      objectType,
      objectId,
      action,
      details,
    });

    let readerIds = [];

    if (customReaderIds) {
      // Use custom reader IDs if provided
      readerIds = customReaderIds;
    } else {
      // Auto-determine readers based on object type
      if (objectType === "case") {
        // Get case assignees + owner
        const caseAssignees = await CaseAssignees.findAll({
          where: { caseId: objectId },
          attributes: ["userId"],
        });
        readerIds = caseAssignees.map((ca) => ca.userId);

        // Add case owner (you'd need to get this from Case model)
        // const case = await Case.findByPk(objectId);
        // if (case && !readerIds.includes(case.ownerId)) {
        //   readerIds.push(case.ownerId);
        // }
      } else if (objectType === "task") {
        // Get task assignees + owner
        const taskAssignees = await TaskAssignees.findAll({
          where: { taskId: objectId },
          attributes: ["userId"],
        });
        readerIds = taskAssignees.map((ta) => ta.userId);

        // Add task owner
        // const task = await Task.findByPk(objectId);
        // if (task && !readerIds.includes(task.ownerId)) {
        //   readerIds.push(task.ownerId);
        // }
      }
    }

    // Create reader relationships
    if (readerIds.length > 0) {
      const readerRecords = readerIds.map((userId) => ({
        activityId: activity.activityId,
        userId,
        isRead: false,
      }));

      await ActivityReaders.bulkCreate(readerRecords);
    }

    return activity;
  } catch (error) {
    console.error("Error creating activity log:", error);
    throw error;
  }
}

// Pre-defined action messages for consistency
export const ACTIVITY_ACTIONS = {
  CASE_CREATED: "case_created",
  CASE_UPDATED: "case_updated",
  CASE_PHASE_CHANGED: "phase_updated",
  CASE_PRIORITY_CHANGED: "priority_updated",
  CASE_ASSIGNEE_ADDED: "assignee_added",
  CASE_ASSIGNEE_REMOVED: "assignee_removed",
  CASE_NOTES_UPDATED: "notes_updated",

  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_STATUS_CHANGED: "status_updated",
  TASK_ASSIGNEE_ADDED: "task_assignee_added",
  TASK_ASSIGNEE_REMOVED: "task_assignee_removed",

  COMMENT_ADDED: "comment_added",
};

export function capitalize(str) {
  return str
    .split(" ")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
