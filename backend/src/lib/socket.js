import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketMiddleware.js";

// Map to store online users: key=userId(string), value=socketId
const onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication
  io.use(async (socket, next) => {
    try {
      await socketAuthMiddleware(socket, next);
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId; // should be a string
    console.log(`User connected: ${socket.user.fullName} (${userId})`);

    // Add user to online users map
    onlineUsers.set(userId, socket.id);

    // Broadcast updated online users array
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    socket.on("sendMessage", (message) => {
      console.log(`Message from ${socket.user.fullName}:`, message);

      // Find the receiver's socket ID from your onlineUsers map
      const receiverSocketId = onlineUsers.get(message.receiverId);

      // Emit the message to the receiver if online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }

      // Also emit to sender for immediate feedback
      
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      console.log(`User disconnected: ${socket.user.fullName} (${userId})`);
    });
  });

  return io;
}
