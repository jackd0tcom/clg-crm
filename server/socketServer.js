import { Server } from "socket.io";
import { createServer } from "http";
import session from "express-session";
import { sessionConfig } from "./config/security.js";
import { User } from "./model.js";

let io = null;

/**
 * Initialize Socket.io server
 * @param {Express} app - Express application instance
 * @returns {Server} Socket.io server instance
 */
export const initializeSocketIO = (app) => {
  // Create HTTP server from Express app
  const httpServer = createServer(app);

  // Initialize Socket.io with CORS configuration
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Use same cookie parser as Express
    cookie: {
      name: "io",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    // Connection timeout
    connectTimeout: 45000,
    // Enable compression
    compression: true,
    // Enable per-message deflation
    perMessageDeflation: true,
  });

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Get session ID from handshake
      const sessionID = socket.handshake.auth.sessionID;

      if (!sessionID) {
        return next(new Error("No session ID provided"));
      }

      // Create a fake request object to use with session middleware
      const req = {
        sessionID: sessionID,
        session: null,
      };

      // Use session middleware to restore session
      await new Promise((resolve, reject) => {
        session(sessionConfig)(req, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check if session exists and has user
      if (!req.session || !req.session.user) {
        return next(new Error("Unauthorized"));
      }

      // Attach user info to socket
      socket.userId = req.session.user.userId;
      socket.user = req.session.user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", async (socket) => {
    console.log(`✅ User ${socket.userId} connected (socket: ${socket.id})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle room joins
    socket.on("join-room", (roomName) => {
      socket.join(roomName);
      console.log(`👤 User ${socket.userId} joined room: ${roomName}`);
    });

    // Handle room leaves
    socket.on("leave-room", (roomName) => {
      socket.leave(roomName);
      console.log(`👋 User ${socket.userId} left room: ${roomName}`);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`❌ User ${socket.userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return { io, httpServer };
};

/**
 * Get Socket.io instance (for use in controllers)
 * @returns {Server} Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call initializeSocketIO first."
    );
  }
  return io;
};
