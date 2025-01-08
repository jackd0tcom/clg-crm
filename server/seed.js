import connectToDB from "./db.js";
import { User, Story, Friend } from "./model.js";
import bcrypt from "bcryptjs";

const db = await connectToDB("postgresql:///story-db");

const users = [
  {
    username: "jack",
    password: bcrypt.hashSync("jack", 10), // Example password
    firstName: "jack",
    lastName: "b",
    userBio: "jacks bio",
  },
  {
    username: "han",
    password: bcrypt.hashSync("han", 10),
    firstName: "hannah",
    lastName: "b",
    userBio: "hannah's bio",
  },
  {
    username: "ebot9",
    password: bcrypt.hashSync("ebot9", 10),
    firstName: "ethan",
    lastName: "g",
    userBio: "ethan's bio",
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

const friends = [
  { userId: 1, friendId: 2, status: "accepted" },
  { userId: 2, friendId: 3, status: "accepted" },
  { userId: 1, friendId: 3, status: "accepted" },
];

await db.sync({ force: true }).then(async () => {
  await User.bulkCreate(users);
  await Story.bulkCreate(stories);
  await Friend.bulkCreate(friends);
  console.log("db reset and seeded");
});

await db.close();
