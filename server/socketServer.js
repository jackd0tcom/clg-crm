import { Server } from "socket.io";
import { createServer } from "http";
import { sessionMiddleware } from "./config/security.js";
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
  const noopRes = {
    setHeader() {},
    getHeader() {
      return undefined;
    },
    writeHead() {},
    end() {},
  };
  
  io.use((socket, next) => {
    sessionMiddleware(socket.request, noopRes, (err) => {
      if (err) {
        return next(err);
      }
      const req = socket.request;
      if (!req.session || !req.session.user) {
        return next(new Error("Unauthorized"));
      }
      socket.userId = req.session.user.userId;
      socket.user = req.session.user;
      next();
    });
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
