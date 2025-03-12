// socket.js
const socketIo = require("socket.io");

module.exports = (server) => {
  // Initialize Socket.io with your server instance
  const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  // In-memory storage for messages (consider a persistent store for production)
  let messages = [];

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send existing messages to the connected client
    socket.emit("existingMessages", messages);

    // Listen for incoming messages
    socket.on("sendMessage", (message) => {
      console.log("Received message:", message);
      messages.push(message);
      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
};
