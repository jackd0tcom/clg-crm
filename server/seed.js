import connectToDB from "./db.js";
import { User, Story } from "./model.js";
import bcrypt from "bcryptjs";

const db = await connectToDB("postgresql:///story-db");

const users = [
  {
    username: "jack",
    password: bcrypt.hashSync("jack", 10), // Example password
  },
  {
    username: "bob",
    password: bcrypt.hashSync("password456", 10), // Example password
  },
  {
    username: "charlie",
    password: bcrypt.hashSync("password789", 10), // Example password
  },
];

const stories = [
  {
    userId: 1, // Alice's userId
    title: "A Mysterious Journey",
    content:
      "In the quiet town of Eldore, the moonlight shone brightly, casting eerie shadows on the cobblestone streets...",
  },
  // Stories for Bob
  {
    userId: 2, // Bob's userId
    title: "The Lost Treasure",
    content:
      "Bob had always dreamed of finding a hidden treasure, but he never expected to stumble upon it in the most unlikely of places...",
  },
  // Stories for Charlie
  {
    userId: 3, // Charlie's userId
    title: "A Glimpse of Eternity",
    content:
      "Charlie had always felt out of place in the world, until one fateful day when he saw a strange light in the sky...",
  },
];

await db.sync({ force: true }).then(async () => {
  await User.bulkCreate(users);
  const newMovies = await Story.bulkCreate(stories);
  console.log("db reset and seeded");
});

await db.close();
