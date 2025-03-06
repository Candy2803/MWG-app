const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/user');
const contributionRoutes = require('./routes/contributions');
const resetPasswordRoutes = require('./routes/resetPassword');
const express = require('express');
const http = require('http');   // Import http module for server
const socketIo = require('socket.io');  // Import socket.io
const app = express(); 

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Define routes
app.use('/api/users', userRoutes); 
app.use('/api/contributions', contributionRoutes); 
app.use('/api/reset', resetPasswordRoutes);

// Create the HTTP server with express app
const server = http.createServer(app);

// Initialize socket.io with the server
const io = socketIo(server);

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    // Broadcast the message to all clients (including the sender)
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit if there's a connection error
  });
