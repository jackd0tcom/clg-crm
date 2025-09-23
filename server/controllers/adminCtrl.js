import { User } from "../model.js";

export default {
  requireAdmin: (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
        message: "Only administrators can access this endpoint",
      });
    }
    next();
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          "userId",
          "username",
          "firstName",
          "lastName",
          "email",
          "role",
          "isAllowed",
          "createdAt",
          "profilePic",
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        users: users.map((user) => ({
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isAllowed: user.isAllowed,
          createdAt: user.createdAt,
          profilePic: user.profilePic,
          fullName:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username,
        })),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        error: "Failed to fetch users",
        message: "An error occurred while retrieving user data",
      });
    }
  },
  updateUserAccess: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAllowed } = req.body;

      if (typeof isAllowed !== "boolean") {
        return res.status(400).json({
          error: "Invalid request",
          message: "isAllowed must be a boolean value",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "The specified user does not exist",
        });
      }

      // Prevent admin from revoking their own access
      if (user.userId === req.session.user.userId && !isAllowed) {
        return res.status(400).json({
          error: "Cannot revoke own access",
          message: "You cannot revoke your own access to the system",
        });
      }

      await user.update({ isAllowed });

      res.json({
        success: true,
        message: `User access ${
          isAllowed ? "granted" : "revoked"
        } successfully`,
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAllowed: user.isAllowed,
        },
      });
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({
        error: "Failed to update user access",
        message: "An error occurred while updating user permissions",
      });
    }
  },
  addUserByEmail: async (req, res) => {
    try {
      const { email, firstName, lastName, role = "user" } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email required",
          message: "Email address is required to add a new user",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: "User already exists",
          message: "A user with this email address already exists",
          user: {
            userId: existingUser.userId,
            username: existingUser.username,
            email: existingUser.email,
            isAllowed: existingUser.isAllowed,
          },
        });
      }

      // Create new user (they'll be allowed by default)
      const newUser = await User.create({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        username: email.split("@")[0], // Use email prefix as username
        role,
        isAllowed: true,
      });

      res.status(201).json({
        success: true,
        message: "User added successfully",
        user: {
          userId: newUser.userId,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isAllowed: newUser.isAllowed,
        },
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({
        error: "Failed to add user",
        message: "An error occurred while creating the new user",
      });
    }
  },
  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Role must be either 'admin' or 'user'",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "The specified user does not exist",
        });
      }

      // Prevent admin from changing their own role to user
      if (user.userId === req.session.user.userId && role === 'user') {
        return res.status(400).json({
          error: "Cannot change own role",
          message: "You cannot change your own role from admin to user",
        });
      }

      await user.update({ role });

      res.json({
        success: true,
        message: `User role updated to ${role} successfully`,
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({
        error: "Failed to update user role",
        message: "An error occurred while updating user role",
      });
    }
  },
  checkUserAccess: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          isAllowed: false,
          message: "User not authenticated",
        });
      }

      const user = await User.findByPk(req.session.user.userId, {
        attributes: [
          "userId",
          "username",
          "firstName",
          "lastName",
          "email",
          "role",
          "isAllowed",
        ],
      });

      if (!user) {
        return res.status(404).json({
          isAllowed: false,
          message: "User not found",
        });
      }

      res.json({
        isAllowed: user.isAllowed,
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error checking user access:", error);
      res.status(500).json({
        isAllowed: false,
        error: "Failed to check user access",
      });
    }
  },
  bulkUpdateUserAccess: async (req, res) => {
    try {
      const { updates } = req.body; // Array of { userId, isAllowed }

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Updates must be an array of user access changes",
        });
      }

      const results = [];
      const errors = [];

      for (const update of updates) {
        try {
          const { userId, isAllowed } = update;

          if (typeof isAllowed !== "boolean") {
            errors.push({ userId, error: "isAllowed must be boolean" });
            continue;
          }

          const user = await User.findByPk(userId);
          if (!user) {
            errors.push({ userId, error: "User not found" });
            continue;
          }

          // Prevent admin from revoking their own access
          if (user.userId === req.session.user.userId && !isAllowed) {
            errors.push({ userId, error: "Cannot revoke own access" });
            continue;
          }

          await user.update({ isAllowed });
          results.push({ userId, success: true, isAllowed });
        } catch (error) {
          errors.push({ userId, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Updated ${results.length} users successfully`,
        results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error bulk updating user access:", error);
      res.status(500).json({
        error: "Failed to bulk update user access",
        message: "An error occurred while updating user permissions",
      });
    }
  },
};
