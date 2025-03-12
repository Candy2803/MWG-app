// server.js
const express = require("express");
const http = require("http");
const createSocketServer = require("./socket"); // our socket.js file

const app = express();

// Optional: A simple route to confirm the server is live
app.get("/", (req, res) => {
  res.send("Socket.io server is running");
});

// Create an HTTP server and pass our Express app
const server = http.createServer(app);

// Initialize Socket.io with our server
const io = createSocketServer(server);

// Listen on the correct port provided by Render or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
