import { DataTypes, Model } from "sequelize";
import url from "url";
import connectToDb from "./db.js";

const db = await connectToDb(
  process.env.DATABASE_URL || "postgresql:///clg-db"
);

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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePic: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "/default-profile-pic.jpg",
    },
    role: {
      type: DataTypes.ENUM("admin", "team_member", "user"),
      allowNull: false,
    },
    auth0Id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferredCalendarId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    modelName: "user",
    sequelize: db,
    timestamps: true,
  }
);

class Person extends Model {}
Person.init(
  {
    personId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: {
          msg: "Zip Code must be only numbers",
        },
        len: {
          args: [5],
          msg: "Zip Code length is invalid",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: {
          msg: "Phone number must contain only digits.",
        },
        len: {
          args: [10, 15],
          msg: "Phone number length is invalid.",
        },
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    county: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    SSN: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    modelName: "person",
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
      defaultValue: null,
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
    googleEventId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    modelName: "task",
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
      defaultValue: "Case Title",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    modelName: "case",
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
      type: DataTypes.ENUM("case", "task", "person"),
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
    modelName: "activityLog",
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
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    modelName: "activityReaders",
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
    objectType: {
      type: DataTypes.ENUM("case", "task"),
      allowNull: false,
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    modelName: "comment",
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
        "comment",
        "assignment",
        "due_date",
        "status_change",
        "task_created",
        "task_updated",
        "task_deleted",
        "task_assigned",
        "task_unassigned",
        "task_status_changed",
        "task_due_date_changed",
        "task_priority_changed",
        "task_case_changed",
        "case_created",
        "case_updated",
        "case_archived",
        "case_unarchived",
        "case_assigned",
        "case_unassigned",
        "case_phase_changed",
        "case_priority_changed",
        "comment_added"
      ),
      allowNull: false,
    },
    objectType: {
      type: DataTypes.ENUM("case", "task"),
      allowNull: false,
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isCleared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    modelName: "notification",
    sequelize: db,
    timestamps: true,
  }
);

class TaskAssignees extends Model {}
TaskAssignees.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: "taskAssignees",
    sequelize: db,
    timestamps: true,
  }
);

class CaseAssignees extends Model {}
CaseAssignees.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: "caseAssignees",
    sequelize: db,
    timestamps: true,
  }
);
class PracticeArea extends Model {}
PracticeArea.init(
  {
    practiceAreaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    modelName: "practiceArea",
    sequelize: db,
    timestamps: true,
  }
);

// Junction table for case-practice area relationships
class CasePracticeAreas extends Model {}
CasePracticeAreas.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    practiceAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: "casePracticeAreas",
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

Case.belongsToMany(PracticeArea, {
  through: CasePracticeAreas,
  as: "practiceAreas",
  foreignKey: "caseId",
  otherKey: "practiceAreaId",
});
PracticeArea.belongsToMany(Case, {
  through: CasePracticeAreas,
  as: "cases",
  foreignKey: "practiceAreaId",
  otherKey: "caseId",
});
// Case has many people involved
Case.hasMany(Person, { foreignKey: "caseId", as: "people" });
Person.belongsTo(Case, { foreignKey: "caseId" });

// Case-Task relationships
Case.hasMany(Task, { foreignKey: "caseId", as: "tasks" });
Task.belongsTo(Case, { foreignKey: "caseId", as: "case" });

// Case-Person relationships
Case.hasMany(Person, { foreignKey: "caseId" });
Person.belongsTo(Case, { foreignKey: "caseId" });

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

// Add Task relationship to Notification (for task notifications)
Task.hasMany(Notification, { foreignKey: "objectId", constraints: false });
Notification.belongsTo(Task, {
  foreignKey: "objectId",
  constraints: false,
  as: "task",
});

Case.hasMany(Notification, { foreignKey: "objectId", constraints: false });
Notification.belongsTo(Case, {
  foreignKey: "objectId",
  constraints: false,
  as: "case",
});

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
  await db.sync({ alter: true });
  await db.close();
  console.log("Finished syncing database!");
}

export {
  User,
  Task,
  Case,
  Person,
  ActivityLog,
  Comment,
  Notification,
  CaseAssignees,
  TaskAssignees,
  ActivityReaders,
  PracticeArea,
  CasePracticeAreas,
};
