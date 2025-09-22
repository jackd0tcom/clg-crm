import cron from 'node-cron';
import { 
  cleanupActivityLogs,
  cleanupNotifications,
  cleanupComments,
  cleanupCompletedTasks,
  getDatabaseStats
} from '../helpers/dataCleanupHelper.js';
import { ActivityLog, Notification, Comment, Case, Task, Person } from '../model.js';
import { Op } from 'sequelize';

/**
 * Automated Data Cleanup Scheduler
 * 
 * Runs periodic cleanup operations to maintain database performance
 * without manual intervention.
 */

class CleanupScheduler {
  constructor() {
    this.isRunning = false;
    this.lastCleanup = null;
    this.cleanupHistory = [];
  }

  /**
   * Start the automated cleanup scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cleanup scheduler is already running');
      return;
    }

    console.log('🚀 Starting automated cleanup scheduler...');

    // Run cleanup every Sunday at 2:00 AM
    // This is a good time when the system is typically less active
    cron.schedule('0 2 * * 0', async () => {
      await this.runWeeklyCleanup();
    });

    // Run lightweight cleanup every day at 3:00 AM
    // Only notifications and very old activity logs
    cron.schedule('0 3 * * *', async () => {
      await this.runDailyCleanup();
    });

    // Run monthly deep cleanup on the 1st at 4:00 AM
    // More aggressive cleanup of old data
    cron.schedule('0 4 1 * *', async () => {
      await this.runMonthlyCleanup();
    });

    this.isRunning = true;
    console.log('✅ Automated cleanup scheduler started');
    console.log('📅 Schedule:');
    console.log('   - Daily cleanup: 3:00 AM (notifications, old activity logs)');
    console.log('   - Weekly cleanup: Sunday 2:00 AM (full cleanup)');
    console.log('   - Monthly cleanup: 1st of month 4:00 AM (deep cleanup)');
  }

  /**
   * Stop the cleanup scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Cleanup scheduler is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('🛑 Automated cleanup scheduler stopped');
  }

  /**
   * Run daily cleanup (lightweight)
   */
  async runDailyCleanup() {
    console.log('🌅 Starting daily cleanup...');
    
    try {
      const startTime = new Date();
      const results = {};

      // Clean up old notifications (6 months)
      results.notifications = await cleanupNotifications();
      
      // Clean up very old activity logs (3+ years)
      // We'll modify the helper to accept custom retention period
      results.oldActivityLogs = await this.cleanupVeryOldActivityLogs();

      const endTime = new Date();
      const duration = endTime - startTime;

      const cleanupRecord = {
        type: 'daily',
        timestamp: startTime,
        duration: duration,
        results: results
      };

      this.cleanupHistory.unshift(cleanupRecord);
      this.lastCleanup = startTime;

      // Keep only last 30 cleanup records
      if (this.cleanupHistory.length > 30) {
        this.cleanupHistory = this.cleanupHistory.slice(0, 30);
      }

      console.log(`✅ Daily cleanup completed in ${duration}ms`);
      console.log(`   - Notifications cleaned: ${results.notifications}`);
      console.log(`   - Old activity logs cleaned: ${results.oldActivityLogs}`);

    } catch (error) {
      console.error('❌ Error during daily cleanup:', error);
    }
  }

  /**
   * Run weekly cleanup (standard)
   */
  async runWeeklyCleanup() {
    console.log('📅 Starting weekly cleanup...');
    
    try {
      const startTime = new Date();
      const results = {};

      // Get stats before cleanup
      const statsBefore = await getDatabaseStats();

      // Run standard cleanup operations
      results.activityLogs = await cleanupActivityLogs();
      results.notifications = await cleanupNotifications();
      results.comments = await cleanupComments();
      results.completedTasks = await cleanupCompletedTasks();

      // Get stats after cleanup
      const statsAfter = await getDatabaseStats();

      const endTime = new Date();
      const duration = endTime - startTime;

      const cleanupRecord = {
        type: 'weekly',
        timestamp: startTime,
        duration: duration,
        results: results,
        statsBefore: statsBefore,
        statsAfter: statsAfter
      };

      this.cleanupHistory.unshift(cleanupRecord);
      this.lastCleanup = startTime;

      // Keep only last 30 cleanup records
      if (this.cleanupHistory.length > 30) {
        this.cleanupHistory = this.cleanupHistory.slice(0, 30);
      }

      console.log(`✅ Weekly cleanup completed in ${duration}ms`);
      console.log(`   - Activity logs: ${results.activityLogs}`);
      console.log(`   - Notifications: ${results.notifications}`);
      console.log(`   - Comments: ${results.comments}`);
      console.log(`   - Completed tasks: ${results.completedTasks}`);

      // Log database size reduction
      const totalReduction = (statsBefore.activityLogs + statsBefore.notifications + statsBefore.comments + statsBefore.completedTasks) -
                           (statsAfter.activityLogs + statsAfter.notifications + statsAfter.comments + statsAfter.completedTasks);
      
      if (totalReduction > 0) {
        console.log(`📊 Database size reduced by ${totalReduction} records`);
      }

    } catch (error) {
      console.error('❌ Error during weekly cleanup:', error);
    }
  }

  /**
   * Run monthly cleanup (deep)
   */
  async runMonthlyCleanup() {
    console.log('🗓️ Starting monthly deep cleanup...');
    
    try {
      const startTime = new Date();
      const results = {};

      // Get comprehensive stats before cleanup
      const statsBefore = await getDatabaseStats();

      // Run all cleanup operations with smaller batch sizes for thoroughness
      results.activityLogs = await this.cleanupActivityLogsThoroughly();
      results.notifications = await this.cleanupNotificationsThoroughly();
      results.comments = await this.cleanupCommentsThoroughly();
      results.completedTasks = await this.cleanupCompletedTasksThoroughly();

      // Get stats after cleanup
      const statsAfter = await getDatabaseStats();

      const endTime = new Date();
      const duration = endTime - startTime;

      const cleanupRecord = {
        type: 'monthly',
        timestamp: startTime,
        duration: duration,
        results: results,
        statsBefore: statsBefore,
        statsAfter: statsAfter
      };

      this.cleanupHistory.unshift(cleanupRecord);
      this.lastCleanup = startTime;

      // Keep only last 30 cleanup records
      if (this.cleanupHistory.length > 30) {
        this.cleanupHistory = this.cleanupHistory.slice(0, 30);
      }

      console.log(`✅ Monthly deep cleanup completed in ${duration}ms`);
      console.log(`   - Activity logs: ${results.activityLogs}`);
      console.log(`   - Notifications: ${results.notifications}`);
      console.log(`   - Comments: ${results.comments}`);
      console.log(`   - Completed tasks: ${results.completedTasks}`);

      // Log comprehensive database size reduction
      const totalReduction = (statsBefore.activityLogs + statsBefore.notifications + statsBefore.comments + statsBefore.completedTasks) -
                           (statsAfter.activityLogs + statsAfter.notifications + statsAfter.comments + statsAfter.completedTasks);
      
      if (totalReduction > 0) {
        console.log(`📊 Database size reduced by ${totalReduction} records`);
      }

    } catch (error) {
      console.error('❌ Error during monthly cleanup:', error);
    }
  }

  /**
   * Clean up very old activity logs (3+ years)
   */
  async cleanupVeryOldActivityLogs() {

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (3 * 365)); // 3 years
      
      const deletedCount = await ActivityLog.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate
          }
        },
        limit: 2000 // Larger batch for very old data
      });
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up very old activity logs:', error);
      return 0;
    }
  }

  /**
   * Thorough cleanup operations with smaller batch sizes
   */
  async cleanupActivityLogsThoroughly() {

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 730); // 2 years
      
      let totalDeleted = 0;
      let deletedThisBatch;
      
      // Run multiple smaller batches for thoroughness
      do {
        deletedThisBatch = await ActivityLog.destroy({
          where: {
            createdAt: {
              [Op.lt]: cutoffDate
            }
          },
          limit: 500 // Smaller batches
        });
        
        totalDeleted += deletedThisBatch;
        
        // Small delay between batches to prevent database locks
        if (deletedThisBatch > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } while (deletedThisBatch > 0);
      
      return totalDeleted;
    } catch (error) {
      console.error('Error in thorough activity log cleanup:', error);
      return 0;
    }
  }

  async cleanupNotificationsThoroughly() {

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 180); // 6 months
      
      let totalDeleted = 0;
      let deletedThisBatch;
      
      do {
        deletedThisBatch = await Notification.destroy({
          where: {
            createdAt: {
              [Op.lt]: cutoffDate
            }
          },
          limit: 250
        });
        
        totalDeleted += deletedThisBatch;
        
        if (deletedThisBatch > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } while (deletedThisBatch > 0);
      
      return totalDeleted;
    } catch (error) {
      console.error('Error in thorough notification cleanup:', error);
      return 0;
    }
  }

  async cleanupCommentsThoroughly() {

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 1095); // 3 years
      
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
        return 0;
      }
      
      let totalDeleted = 0;
      let deletedThisBatch;
      
      do {
        deletedThisBatch = await Comment.destroy({
          where: {
            objectType: 'case',
            objectId: {
              [Op.in]: caseIds
            }
          },
          limit: 250
        });
        
        totalDeleted += deletedThisBatch;
        
        if (deletedThisBatch > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } while (deletedThisBatch > 0);
      
      return totalDeleted;
    } catch (error) {
      console.error('Error in thorough comment cleanup:', error);
      return 0;
    }
  }

  async cleanupCompletedTasksThoroughly() {

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 year
      
      let totalDeleted = 0;
      let deletedThisBatch;
      
      do {
        deletedThisBatch = await Task.destroy({
          where: {
            status: 'completed',
            updatedAt: {
              [Op.lt]: cutoffDate
            }
          },
          limit: 100
        });
        
        totalDeleted += deletedThisBatch;
        
        if (deletedThisBatch > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } while (deletedThisBatch > 0);
      
      return totalDeleted;
    } catch (error) {
      console.error('Error in thorough completed task cleanup:', error);
      return 0;
    }
  }

  /**
   * Get cleanup status and history
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCleanup: this.lastCleanup,
      cleanupHistory: this.cleanupHistory.slice(0, 10) // Last 10 cleanups
    };
  }

  /**
   * Manually trigger a cleanup (for testing or emergency)
   */
  async triggerManualCleanup(type = 'weekly') {
    console.log(`🔧 Manually triggering ${type} cleanup...`);
    
    switch (type) {
      case 'daily':
        await this.runDailyCleanup();
        break;
      case 'weekly':
        await this.runWeeklyCleanup();
        break;
      case 'monthly':
        await this.runMonthlyCleanup();
        break;
      default:
        throw new Error('Invalid cleanup type');
    }
  }
}

// Create singleton instance
const cleanupScheduler = new CleanupScheduler();

export default cleanupScheduler;
