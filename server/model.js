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
  },
  {
    modelName: "users",
    sequelize: db,
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
  },
  {
    modelName: "story",
    sequelize: db,
    timestamps: true,
  }
);

User.hasMany(Story, { foreignKey: "userId" });
Story.belongsTo(User, { foreignKey: "userId" });

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  console.log("Syncing database...");
  await db.sync({ force: true });
  await db.close();
  console.log("Finished syncing database!");
}

export { User, Story };
