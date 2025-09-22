# Automated Database Cleanup System

## Overview

The CLG CRM now includes an automated database cleanup system that runs in the background to maintain optimal performance and prevent data bloat. This system automatically removes old data based on configurable retention policies.

## How It Works

The cleanup system runs on a schedule using cron jobs:

### Daily Cleanup (3:00 AM)
- **Notifications**: Removes notifications older than 6 months
- **Very Old Activity Logs**: Removes activity logs older than 3 years
- **Purpose**: Lightweight maintenance to keep the system running smoothly

### Weekly Cleanup (Sunday 2:00 AM)
- **Activity Logs**: Removes logs older than 2 years
- **Notifications**: Removes notifications older than 6 months  
- **Comments**: Removes comments from archived/closed cases older than 3 years
- **Completed Tasks**: Removes completed tasks older than 1 year
- **Purpose**: Standard maintenance to prevent database bloat

### Monthly Cleanup (1st of month 4:00 AM)
- **Deep Cleanup**: Same as weekly but with smaller batch sizes for thoroughness
- **Purpose**: Comprehensive cleanup to ensure optimal performance

## Retention Policies

| Data Type | Retention Period | Batch Size |
|-----------|------------------|------------|
| Activity Logs | 2 years | 1000 (weekly), 500 (monthly) |
| Notifications | 6 months | 500 (weekly), 250 (monthly) |
| Comments | 3 years (archived cases only) | 500 (weekly), 250 (monthly) |
| Completed Tasks | 1 year | 200 (weekly), 100 (monthly) |
| Archived Cases | 5 years | 50 (disabled by default) |

## Features

### Automatic Operation
- ✅ Runs automatically without manual intervention
- ✅ Uses cron scheduling for precise timing
- ✅ Runs during low-usage hours (2-4 AM)
- ✅ Includes delays between batches to prevent database locks

### Safety Features
- ✅ Batch processing prevents database locks
- ✅ Comprehensive error handling and logging
- ✅ Cleanup history tracking (last 30 operations)
- ✅ Archived case cleanup disabled by default for legal compliance
- ✅ Only removes data that meets retention criteria

### Monitoring
- ✅ Detailed console logging for all operations
- ✅ Cleanup history and statistics
- ✅ Database size reduction tracking
- ✅ Error reporting and recovery

## Configuration

The cleanup system is configured in `server/services/cleanupScheduler.js`. You can modify:

- **Retention periods** in the `CLEANUP_POLICIES` object
- **Schedule times** using cron expressions
- **Batch sizes** for different cleanup types
- **Cleanup types** and what data gets removed

## Manual Operations

While the system runs automatically, you can still trigger manual cleanups:

### API Endpoints (Admin Only)
- `GET /api/cleanup/status` - Check scheduler status and history
- `GET /api/cleanup/stats` - Get current database statistics
- `POST /api/cleanup/full` - Run full cleanup immediately

### Programmatic Access
```javascript
const cleanupScheduler = require('./services/cleanupScheduler.js');

// Check status
const status = cleanupScheduler.getStatus();

// Trigger manual cleanup
await cleanupScheduler.triggerManualCleanup('weekly');
```

## Database Impact

### Before Cleanup
- Activity logs accumulate indefinitely
- Notifications pile up over time
- Comments from old cases remain forever
- Completed tasks never get removed

### After Cleanup
- Database size stays manageable
- Query performance remains optimal
- Storage costs stay predictable
- System responsiveness maintained

## Legal Considerations

### Data Retention Compliance
- ⚠️ **Archived case cleanup is disabled by default**
- ⚠️ **Review local data retention requirements**
- ⚠️ **Consider legal hold requirements**
- ⚠️ **Backup important data before major cleanups**

### Recommended Approach
1. **Review your legal requirements** for data retention
2. **Adjust retention periods** in `CLEANUP_POLICIES` if needed
3. **Enable archived case cleanup** only after legal review
4. **Set up regular backups** before major cleanups
5. **Monitor cleanup logs** for compliance

## Troubleshooting

### Common Issues

**Cleanup not running:**
- Check server logs for cron job errors
- Verify `node-cron` package is installed
- Ensure server is running during scheduled times

**Database locks:**
- System includes automatic delays between batches
- Reduce batch sizes if issues persist
- Run cleanups during low-usage periods

**Missing data:**
- Check cleanup history in logs
- Verify retention policies are appropriate
- Restore from backup if needed

### Logs and Monitoring

The system provides detailed logging:
```
🚀 Starting automated cleanup scheduler...
✅ Weekly cleanup completed in 1250ms
   - Activity logs: 150
   - Notifications: 75
   - Comments: 23
   - Completed tasks: 12
📊 Database size reduced by 260 records
```

## Getting Started

1. **Install dependencies**: `npm install node-cron`
2. **Start your server**: The cleanup scheduler starts automatically
3. **Monitor logs**: Watch for cleanup completion messages
4. **Check status**: Use `/api/cleanup/status` endpoint
5. **Adjust policies**: Modify retention periods as needed

The system is designed to run silently in the background, keeping your database optimized without any manual intervention required!
