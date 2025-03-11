const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Route imports
const userRoutes = require('./routes/user');
const contributionRoutes = require('./routes/contributions');
const resetPasswordRoutes = require('./routes/resetPassword');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Adjust in production for security
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/reset', resetPasswordRoutes);

// File Upload Route
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }

        console.log("Cloudinary upload result:", result);
        res.status(200).json({
          message: "File uploaded successfully",
          url: result.secure_url,
        });
      }
    );

    req.file.stream.pipe(uploadStream); // Pipe the file directly to Cloudinary
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// Socket.io Setup
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
