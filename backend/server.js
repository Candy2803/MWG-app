const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();

const app = express();

// Create an HTTP server from Express
const server = http.createServer(app);

// Setup Socket.io on the server
const io = socketIo(server);

// Middleware Setup
app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Setup (Temporary Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Route
// Server-side code with multer handling

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Received file:", req.file); // Log the file to ensure it is being received correctly

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "auto" }, // Auto-detect file type
      (error, cloudinaryResult) => {
        if (error) {
          console.error("Cloudinary upload error:", error); // Log the error from Cloudinary
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }

        console.log("Cloudinary upload result:", cloudinaryResult); // Log the successful upload result

        res.status(200).json({ message: "File uploaded successfully", url: cloudinaryResult.secure_url });
      }
    );

    req.file.stream.pipe(result); // Pipe the file stream to Cloudinary

  } catch (error) {
    console.error("Error in file upload:", error); // Log any server-side errors
    res.status(500).json({ message: "Error uploading file", error });
  }
});



// Socket.io event handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);
    io.emit("message", message); // Send message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = router;
