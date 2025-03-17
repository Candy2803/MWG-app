const express = require("express");
const http = require("http");
const createSocketServer = require("./socket");
const cors = require("cors");

const app = express();
app.use(cors());

// Optional: A simple route to confirm the server is live
app.get("/", (req, res) => {
    console.log("Socket.io server is running");
  res.send("Socket.io server is running");
});

const server = http.createServer(app);
const io = createSocketServer(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
