const socketIo = require("socket.io");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  let messages = [];

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send existing messages to the connected client
    socket.emit("existingMessages", messages);

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
