import { 
  cleanupActivityLogs,
  cleanupNotifications,
  cleanupComments,
  cleanupCompletedTasks,
  cleanupArchivedCases,
  getDatabaseStats,
  runFullCleanup,
  CLEANUP_POLICIES
} from '../helpers/dataCleanupHelper.js';

/**
 * Data Cleanup Controller
 * 
 * Provides API endpoints for database cleanup and maintenance
 */

export default {
  /**
   * Get database statistics
   */
  getDatabaseStats: async (req, res) => {
    try {
      const stats = await getDatabaseStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting database stats:', error);
      res.status(500).json({ error: 'Failed to get database statistics' });
    }
  },

  /**
   * Get cleanup policies configuration
   */
  getCleanupPolicies: async (req, res) => {
    try {
      res.status(200).json(CLEANUP_POLICIES);
    } catch (error) {
      console.error('Error getting cleanup policies:', error);
      res.status(500).json({ error: 'Failed to get cleanup policies' });
    }
  },

  /**
   * Clean up activity logs
   */
  cleanupActivityLogs: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const deletedCount = await cleanupActivityLogs();
      res.status(200).json({ 
        message: 'Activity logs cleanup completed',
        deletedCount 
      });
    } catch (error) {
      console.error('Error cleaning up activity logs:', error);
      res.status(500).json({ error: 'Failed to cleanup activity logs' });
    }
  },

  /**
   * Clean up notifications
   */
  cleanupNotifications: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const deletedCount = await cleanupNotifications();
      res.status(200).json({ 
        message: 'Notifications cleanup completed',
        deletedCount 
      });
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      res.status(500).json({ error: 'Failed to cleanup notifications' });
    }
  },

  /**
   * Clean up comments
   */
  cleanupComments: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const deletedCount = await cleanupComments();
      res.status(200).json({ 
        message: 'Comments cleanup completed',
        deletedCount 
      });
    } catch (error) {
      console.error('Error cleaning up comments:', error);
      res.status(500).json({ error: 'Failed to cleanup comments' });
    }
  },

  /**
   * Clean up completed tasks
   */
  cleanupCompletedTasks: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const deletedCount = await cleanupCompletedTasks();
      res.status(200).json({ 
        message: 'Completed tasks cleanup completed',
        deletedCount 
      });
    } catch (error) {
      console.error('Error cleaning up completed tasks:', error);
      res.status(500).json({ error: 'Failed to cleanup completed tasks' });
    }
  },

  /**
   * Clean up archived cases (disabled by default for safety)
   */
  cleanupArchivedCases: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const deletedCount = await cleanupArchivedCases();
      res.status(200).json({ 
        message: 'Archived cases cleanup completed (disabled for safety)',
        deletedCount 
      });
    } catch (error) {
      console.error('Error cleaning up archived cases:', error);
      res.status(500).json({ error: 'Failed to cleanup archived cases' });
    }
  },

  /**
   * Run full cleanup (all operations)
   */
  runFullCleanup: async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const results = await runFullCleanup();
      res.status(200).json({ 
        message: 'Full database cleanup completed',
        results 
      });
    } catch (error) {
      console.error('Error running full cleanup:', error);
      res.status(500).json({ error: 'Failed to run full cleanup' });
    }
  }
};
