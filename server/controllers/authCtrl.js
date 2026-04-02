import { User, UserSettings, AllowedEmails } from "../model.js";
import bcrypt from "bcryptjs";

export default {
  register: async (req, res) => {
    try {
      console.log("register");
      const { username, password, firstName, lastName, role } = req.body;

      const foundUser = await User.findOne({ where: { username } });

      if (foundUser) {
        res.status(400).send("That username is already taken.");
      } else {
        // password hashing
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
          username,
          password: hash,
          firstName,
          lastName,
          role,
        });
        req.session.user = {
          userId: newUser.userId,
          username: newUser.username,
          firstName: firstName,
          lastName: lastName,
          role: role,
        };

        res.status(200).send(req.session.user);
        console.log(req.session.user);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  },

  login: async (req, res) => {
    try {
      console.log("login");
      const { username, password } = req.body;

      const foundUser = await User.findOne({ where: { username } });
      if (foundUser) {
        const loggedIn = bcrypt.compareSync(password, foundUser.password);
        if (loggedIn) {
          req.session.user = {
            userId: foundUser.userId,
            username: foundUser.username,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            profilePic: foundUser.profilePic,
            role: foundUser.role,
            isAllowed: foundUser.isAllowed,
          };
          res.send(req.session.user);
          console.log("logged in successfully!");
        } else {
          res.status(401).send("Incorrect Password");
        }
      } else {
        res.status(400).send("There is no user with that username");
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500).send("something broke");
    }
  },

  checkUser: async (req, res) => {
    if (req.session.user) {
      res.status(200).send(req.session.user);
    } else {
      res.status(400).send("There is no user on the session");
    }
  },
  addUser: async (req, res) => {
    console.log("addUser");
    try {
      if (!req.session.user) {
        res.status(401).send("User not authenticated");
        return;
      }

      const { email } = req.body;

      const existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        const allowedEmail = await AllowedEmails.create({ email });
        res.status(200).send(allowedEmail);
        return;
      } else res.status(404).send("email already added");
    } catch (error) {
      console.log(error);
      res.send(500).send(error);
    }
  },
  logout: async (req, res) => {
    console.log("logout");
    req.session.destroy();
    res.status(200).send("there is no user on the session boi");
  },
  syncAuth0User: async (req, res) => {
    console.log("syncUser");
    try {
      const { auth0Id, email, name, picture, auth0AccessToken } = req.body;

      // Check if user exists by auth0Id
      let user = await User.findOne({ where: { auth0Id } });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        // Create new user from Auth0 data
        const [firstName, ...lastNameParts] = name.split(" ");

        // Check if this is an admin user (support multiple emails)
        const adminEmails = process.env.ADMIN_EMAIL
          ? process.env.ADMIN_EMAIL.split(",").map((e) => e.trim())
          : [];
        const isAdmin = adminEmails.includes(email);

        const emailCheck = await AllowedEmails.findOne({
          where: { email },
        });

        let isAllowedEmail;

        if (emailCheck) {
          isAllowedEmail = emailCheck.toJSON().email === email;
        }

        console.log(`🔍 Admin check for ${email}:`);
        console.log(`   ADMIN_EMAIL env var: "${process.env.ADMIN_EMAIL}"`);
        console.log(
          `   Parsed admin emails: [${adminEmails.map((e) => `"${e}"`).join(", ")}]`,
        );
        console.log(`   Is admin: ${isAdmin}`);
        console.log(`   Is allowed already: ${isAllowedEmail}`);
        const userCount = await User.count();
        const isFirstUser = userCount === 0;

        user = await User.create({
          auth0Id,
          username: email,
          firstName,
          lastName: lastNameParts.join(" ") || "",
          email,
          profilePic: picture,
          role: isAdmin || isFirstUser ? "admin" : "user",
          authProvider: "auth0",
          isAllowed: isAdmin || isFirstUser || isAllowedEmail, // Admin emails or first user gets access
        });

        if (emailCheck) {
          emailCheck.destroy();
        }

        const newUserSettings = await UserSettings.create({
          userId: user.userId,
        });

        if (isAdmin || isFirstUser) {
          console.log(
            `🎉 Admin user created: ${email} (${isAdmin ? "configured admin" : "first user"})`,
          );
        }
      } else {
        // Check if user has user settings yet
        const userSettings = await UserSettings.findOne({
          where: { userId: user.userId },
        });

        if (!userSettings) {
          await UserSettings.create({
            userId: user.userId,
          });
        }
      }

      // Check if user has Google Calendar connected
      const hasGoogleCalendar =
        user.googleAccessToken && user.googleRefreshToken;

      if (isNewUser && !hasGoogleCalendar) {
        console.log(
          `📅 New user ${user.userId} - Google Calendar connection available via Settings page`,
        );
        // You could add a flag here to show a calendar setup prompt on the frontend
      }

      // Always sync user to session, let frontend handle access control
      console.log(
        `User synced: ${email} (${user.userId}) - Allowed: ${user.isAllowed}`,
      );

      // Set up session with your local user data
      req.session.user = {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authProvider: "auth0",
        profilePic: user.profilePic,
        isAllowed: user.isAllowed,
      };

      res.status(200).json({ user: req.session.user });
    } catch (err) {
      console.log("Sync Auth0 user error:", err);
      res.status(500).json({ message: "Failed to sync user" });
    }
  },
};
