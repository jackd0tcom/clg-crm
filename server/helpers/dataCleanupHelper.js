import { Task, Case, ActivityLog, Notification, Comment, Person } from '../model.js';
import { Op } from 'sequelize';

/**
 * Data Cleanup Helper
 * 
 * This helper provides functions to clean up old data while maintaining
 * data integrity and compliance requirements.
 */

// Configuration for cleanup policies
const CLEANUP_POLICIES = {
  // Activity logs older than 2 years
  ACTIVITY_LOGS: {
    retentionDays: 730, // 2 years
    batchSize: 1000
  },
  
  // Notifications older than 6 months
  NOTIFICATIONS: {
    retentionDays: 180, // 6 months
    batchSize: 500
  },
  
  // Comments from archived/closed cases older than 3 years
  COMMENTS: {
    retentionDays: 1095, // 3 years
    batchSize: 500
  },
  
  // Completed tasks older than 1 year
  COMPLETED_TASKS: {
    retentionDays: 365, // 1 year
    batchSize: 200
  },
  
  // Archived cases older than 5 years
  ARCHIVED_CASES: {
    retentionDays: 1825, // 5 years
    batchSize: 50
  }
};

/**
 * Clean up old activity logs
 */
async function cleanupActivityLogs() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_POLICIES.ACTIVITY_LOGS.retentionDays);
    
    console.log(`🧹 Cleaning up activity logs older than ${cutoffDate.toISOString()}`);
    
    const deletedCount = await ActivityLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      },
      limit: CLEANUP_POLICIES.ACTIVITY_LOGS.batchSize
    });
    
    console.log(`✅ Deleted ${deletedCount} old activity logs`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up activity logs:', error);
    throw error;
  }
}

/**
 * Clean up old notifications
 */
async function cleanupNotifications() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_POLICIES.NOTIFICATIONS.retentionDays);
    
    console.log(`🧹 Cleaning up notifications older than ${cutoffDate.toISOString()}`);
    
    const deletedCount = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      },
      limit: CLEANUP_POLICIES.NOTIFICATIONS.batchSize
    });
    
    console.log(`✅ Deleted ${deletedCount} old notifications`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    throw error;
  }
}

/**
 * Clean up comments from archived/closed cases
 */
async function cleanupComments() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_POLICIES.COMMENTS.retentionDays);
    
    console.log(`🧹 Cleaning up comments from archived/closed cases older than ${cutoffDate.toISOString()}`);
    
    // Get archived/closed cases older than cutoff
    const oldArchivedCases = await Case.findAll({
      where: {
        [Op.or]: [
          { isArchived: true },
          { phase: 'closed' }
        ],
        updatedAt: {
          [Op.lt]: cutoffDate
        }
      },
      attributes: ['caseId']
    });
    
    const caseIds = oldArchivedCases.map(c => c.caseId);
    
    if (caseIds.length === 0) {
      console.log('ℹ️ No old archived/closed cases found for comment cleanup');
      return 0;
    }
    
    const deletedCount = await Comment.destroy({
      where: {
        objectType: 'case',
        objectId: {
          [Op.in]: caseIds
        }
      },
      limit: CLEANUP_POLICIES.COMMENTS.batchSize
    });
    
    console.log(`✅ Deleted ${deletedCount} comments from old archived/closed cases`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up comments:', error);
    throw error;
  }
}

/**
 * Clean up old completed tasks
 */
async function cleanupCompletedTasks() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_POLICIES.COMPLETED_TASKS.retentionDays);
    
    console.log(`🧹 Cleaning up completed tasks older than ${cutoffDate.toISOString()}`);
    
    const deletedCount = await Task.destroy({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.lt]: cutoffDate
        }
      },
      limit: CLEANUP_POLICIES.COMPLETED_TASKS.batchSize
    });
    
    console.log(`✅ Deleted ${deletedCount} old completed tasks`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up completed tasks:', error);
    throw error;
  }
}

/**
 * Archive old archived cases (move to cold storage or delete)
 * Note: This is more aggressive - consider your legal/compliance requirements
 */
async function cleanupArchivedCases() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_POLICIES.ARCHIVED_CASES.retentionDays);
    
    console.log(`🧹 Cleaning up archived cases older than ${cutoffDate.toISOString()}`);
    
    // Get very old archived cases
    const oldArchivedCases = await Case.findAll({
      where: {
        isArchived: true,
        updatedAt: {
          [Op.lt]: cutoffDate
        }
      },
      limit: CLEANUP_POLICIES.ARCHIVED_CASES.batchSize,
      include: [
        {
          model: require('../model.js').Person,
          required: false
        }
      ]
    });
    
    if (oldArchivedCases.length === 0) {
      console.log('ℹ️ No old archived cases found for cleanup');
      return 0;
    }
    
    // For legal compliance, you might want to:
    // 1. Export to cold storage (S3, etc.)
    // 2. Anonymize personal data
    // 3. Delete completely
    
    // For now, we'll just log what would be deleted
    console.log(`📋 Found ${oldArchivedCases.length} old archived cases for cleanup:`);
    oldArchivedCases.forEach(c => {
      console.log(`   - Case ${c.caseId}: ${c.title} (${c.updatedAt})`);
    });
    
    // Uncomment the following lines to actually delete:
    // const deletedCount = await Case.destroy({
    //   where: {
    //     caseId: {
    //       [require('sequelize').Op.in]: oldArchivedCases.map(c => c.caseId)
    //     }
    //   }
    // });
    
    console.log('⚠️ Archived case cleanup is disabled by default for safety');
    console.log('   Uncomment the deletion code in cleanupArchivedCases() if needed');
    
    return 0; // Return 0 since we're not actually deleting
  } catch (error) {
    console.error('❌ Error cleaning up archived cases:', error);
    throw error;
  }
}

/**
 * Get database size statistics
 */
async function getDatabaseStats() {
  try {
    const stats = {};
    
    // Count records in each table
    stats.tasks = await Task.count();
    stats.cases = await Case.count();
    stats.archivedCases = await Case.count({ where: { isArchived: true } });
    stats.completedTasks = await Task.count({ where: { status: 'completed' } });
    stats.activityLogs = await ActivityLog.count();
    stats.notifications = await Notification.count();
    stats.comments = await Comment.count();
    stats.persons = await Person.count();
    
    // Get date ranges
    const oldestActivity = await ActivityLog.findOne({
      order: [['createdAt', 'ASC']],
      attributes: ['createdAt']
    });
    
    const newestActivity = await ActivityLog.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['createdAt']
    });
    
    stats.oldestActivity = oldestActivity?.createdAt;
    stats.newestActivity = newestActivity?.createdAt;
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
}

/**
 * Run all cleanup operations
 */
async function runFullCleanup() {
  console.log('🚀 Starting full database cleanup...');
  
  try {
    const results = {};
    
    // Get stats before cleanup
    const statsBefore = await getDatabaseStats();
    console.log('📊 Database stats before cleanup:', statsBefore);
    
    // Run cleanup operations
    results.activityLogs = await cleanupActivityLogs();
    results.notifications = await cleanupNotifications();
    results.comments = await cleanupComments();
    results.completedTasks = await cleanupCompletedTasks();
    results.archivedCases = await cleanupArchivedCases();
    
    // Get stats after cleanup
    const statsAfter = await getDatabaseStats();
    console.log('📊 Database stats after cleanup:', statsAfter);
    
    console.log('✅ Full cleanup completed successfully!');
    return {
      results,
      statsBefore,
      statsAfter
    };
  } catch (error) {
    console.error('❌ Error during full cleanup:', error);
    throw error;
  }
}

export {
  cleanupActivityLogs,
  cleanupNotifications,
  cleanupComments,
  cleanupCompletedTasks,
  cleanupArchivedCases,
  getDatabaseStats,
  runFullCleanup,
  CLEANUP_POLICIES
};
