const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In-memory storage for messages
let messages = [];

// Multer Storage Setup (Temporary Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Route
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert buffer to base64
    const base64File = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "raw",
      format: "pdf",
      folder: "pdf_uploads",
    });

    // Create message object
    const message = { id: messages.length + 1, url: result.secure_url };
    messages.push(message);

    // Emit event to clients
    io.emit("uploadSuccess", message);

    res.status(200).json({ message: "File uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Add this in your server code (e.g., server.js)
app.post("/uploadVideo", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    // Convert buffer to base64 and prepend the proper data URI scheme
    const base64File = `data:video/mp4;base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary with resource_type "video"
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "video",
      folder: "event_videos",
      format: "mp4",
    });

    // Optionally, create a message object and store it if needed
    const message = { id: messages.length + 1, url: result.secure_url };
    messages.push(message);
    
    // Emit event to connected clients if you want to notify them immediately
    io.emit("uploadSuccess", message);

    res.status(200).json({ message: "Video uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Video upload failed" });
  }
});

// In your server.js
app.post("/uploadProfilePicture", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Convert buffer to base64 for Cloudinary upload
    const base64File = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
    // Upload to Cloudinary (ensure Cloudinary config is set)
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "image",
      folder: "profile_pictures",
    });
    res.status(200).json({ message: "Profile picture uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});


// Fetch Messages Route (for newly connected clients)
app.get("/messages", (req, res) => {
  res.json(messages);
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send existing messages to the newly connected client
  socket.emit("existingMessages", messages);

  // Listen for sendMessage events from clients
  socket.on("sendMessage", (message) => {
    console.log("Received message:", message);
    messages.push(message); // Save the message (or use your DB)
    io.emit("message", message); // Broadcast the message to all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});


const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
