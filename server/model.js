import { DataTypes, Model } from "sequelize";
import url from "url";
import connectToDb from "./db.js";

const db = await connectToDb("postgresql:///clg-db");

class User extends Model {}
User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "/src/assets/default-profile-pic.jpg",
    },
    role: {
      type: DataTypes.ENUM("admin", "team_member"),
      allowNull: false,
    },
  },
  {
    modelName: "user",
    sequelize: db,
    timestamps: true,
  }
);

class Task extends Model {}
Task.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      defaultValue: "normal",
    },
    status: {
      type: DataTypes.ENUM(
        "not started",
        "in progress",
        "blocked",
        "completed"
      ),
      defaultValue: "not started",
    },
  },
  {
    modelName: "Task",
    sequelize: db,
    timestamps: true,
  }
);

class Case extends Model {}
Case.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    practiceArea: {
      type: DataTypes.ENUM(
        "divorce",
        "real estate",
        "custody",
        "personal injury",
        "criminal",
        "corporate"
      ),
      allowNull: false,
    },
    phase: {
      type: DataTypes.ENUM(
        "intake",
        "investigation",
        "negotiation",
        "litigation",
        "settlement",
        "closed"
      ),
      defaultValue: "intake",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      defaultValue: "normal",
    },
    status: {
      type: DataTypes.ENUM(
        "not started",
        "in progress",
        "blocked",
        "completed",
        "closed"
      ),
      defaultValue: "not started",
    },
  },
  {
    modelName: "Case",
    sequelize: db,
    timestamps: true,
  }
);

class ActivityLog extends Model {}
ActivityLog.init(
  {
    activityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    objectType: {
      type: DataTypes.ENUM("task", "case", "comment"),
      allowNull: false,
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    modelName: "ActivityLog",
    sequelize: db,
    timestamps: true,
  }
);

// New junction table for multiple readers per activity
class ActivityReaders extends Model {}
ActivityReaders.init(
  {
    activityId: {
      type: DataTypes.INTEGER,
      references: { model: ActivityLog, key: "activityId" },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "userId" },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    modelName: "ActivityReaders",
    sequelize: db,
    timestamps: true,
  }
);

class Comment extends Model {}
Comment.init(
  {
    commentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    modelName: "Comment",
    sequelize: db,
    timestamps: true,
  }
);

class Notification extends Model {}
Notification.init(
  {
    notificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "task_assigned",
        "task_overdue",
        "case_update",
        "comment",
        "status_change"
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.ENUM("task", "case", "comment"),
      allowNull: true,
    },
  },
  {
    modelName: "Notification",
    sequelize: db,
    timestamps: true,
  }
);

class TaskAssignees extends Model {}
TaskAssignees.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      references: { model: Task, key: "taskId" },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "userId" },
    },
  },
  {
    modelName: "TaskAssignees",
    sequelize: db,
    timestamps: true,
  }
);

class CaseAssignees extends Model {}
CaseAssignees.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      references: { model: Case, key: "caseId" },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "userId" },
    },
  },
  {
    modelName: "CaseAssignees",
    sequelize: db,
    timestamps: true,
  }
);

// Many-to-many relationships for assignees
Task.belongsToMany(User, {
  through: TaskAssignees,
  as: "assignees",
  foreignKey: "taskId",
  otherKey: "userId",
});
User.belongsToMany(Task, {
  through: TaskAssignees,
  as: "assignedTasks",
  foreignKey: "userId",
  otherKey: "taskId",
});

Case.belongsToMany(User, {
  through: CaseAssignees,
  as: "assignees",
  foreignKey: "caseId",
  otherKey: "userId",
});
User.belongsToMany(Case, {
  through: CaseAssignees,
  as: "assignedCases",
  foreignKey: "userId",
  otherKey: "caseId",
});

// One-to-many relationships for ownership
User.hasMany(Task, { foreignKey: "ownerId", as: "ownedTasks" });
Task.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

User.hasMany(Case, { foreignKey: "ownerId", as: "ownedCases" });
Case.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

// Case-Task relationships
Case.hasMany(Task, { foreignKey: "caseId" });
Task.belongsTo(Case, { foreignKey: "caseId" });

// Comment relationships
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { as: "author", foreignKey: "authorId" });

Task.hasMany(Comment, { foreignKey: "taskId" });
Comment.belongsTo(Task, { foreignKey: "taskId" });

Case.hasMany(Comment, { foreignKey: "caseId" });
Comment.belongsTo(Case, { foreignKey: "caseId" });

// Notification relationships
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Activity log relationships
User.hasMany(ActivityLog, { foreignKey: "authorId", as: "authoredActivities" });
ActivityLog.belongsTo(User, { as: "author", foreignKey: "authorId" });

// Many-to-many for readers
ActivityLog.belongsToMany(User, {
  through: ActivityReaders,
  as: "readers",
  foreignKey: "activityId",
  otherKey: "userId",
});
User.belongsToMany(ActivityLog, {
  through: ActivityReaders,
  as: "readActivities",
  foreignKey: "userId",
  otherKey: "activityId",
});

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  console.log("Syncing database...");
  await db.sync({ force: true });
  await db.close();
  console.log("Finished syncing database!");
}

export {
  User,
  Task,
  Case,
  ActivityLog,
  Comment,
  Notification,
  CaseAssignees,
  TaskAssignees,
  ActivityReaders,
};
