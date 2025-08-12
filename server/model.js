import { DataTypes, Model } from "sequelize";
import url from "url";
import connectToDb from "./db.js";

const db = await connectToDb("postgresql:///story-db");

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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    modelName: "users",
    sequelize: db,
    timestamps: true,
  }
);

class Story extends Model {}
Story.init(
  {
    storyId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Title",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    modelName: "story",
    sequelize: db,
    timestamps: true,
  }
);

class Friend extends Model {}
Friend.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
    },
    status: {
      type: DataTypes.ENUM("requested", "accepted", "blocked"),
      defaultValue: "requested",
    },
  },
  {
    modelName: "friend",
    sequelize: db,
    timestamps: true,
  }
);

User.hasMany(Story, { foreignKey: "userId" });
Story.belongsTo(User, { foreignKey: "userId" });

User.belongsToMany(User, {
  through: Friend,
  as: "friends",
  foreignKey: "userId",
  otherKey: "friendId",
});

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  console.log("Syncing database...");
  await db.sync({ force: true });
  await db.close();
  console.log("Finished syncing database!");
}

export { User, Story, Friend };
