const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");

// Route imports (make sure these exist in your project)
const userRoutes = require("./routes/user");
const contributionRoutes = require("./routes/contributions");
const resetPasswordRoutes = require("./routes/resetPassword");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io by importing your socket logic
const io = require("./socket")(server);

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/reset", resetPasswordRoutes);

// ----- File Upload Endpoints ----- //

// Upload PDF file
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const base64File = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "raw",
      format: "pdf",
      folder: "pdf_uploads",
    });

    // Emit upload success message
    const message = { id: Date.now(), url: result.secure_url };
    io.emit("uploadSuccess", message);

    res.status(200).json({ message: "File uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Upload Image (for events)
app.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });
      
    const base64File = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "image",
      folder: "event_images",
    });

    res.status(200).json({ message: "Image uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Upload Video (for events)
app.post("/uploadVideo", upload.single("video"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No video uploaded" });
      
    const base64File = `data:video/mp4;base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "video",
      folder: "event_videos",
      format: "mp4",
    });

    const message = { id: Date.now(), url: result.secure_url };
    io.emit("uploadSuccess", message);

    res.status(200).json({ message: "Video uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Video upload failed" });
  }
});

// Upload Profile Picture
app.post("/uploadProfilePicture", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });
      
    const base64File = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
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

// Generic File Upload using Cloudinary's upload_stream (avoid conflict by using /uploadFile)
app.post("/uploadFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });
      
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    res.status(200).json({ message: "File uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// Fetch Messages Route (for clients connecting via Socket.io)
app.get("/messages", (req, res) => {
  res.json([]); // You might opt to fetch messages from a DB or leave it empty
});

// ----- MongoDB Connection ----- //

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});

// ----- Error Handling Middleware ----- //

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});
