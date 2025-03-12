const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Send existing messages to the newly connected client
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
