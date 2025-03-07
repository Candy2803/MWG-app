const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow cross-origin requests

const server = http.createServer(app);
const io = socketIo(server);

// Store messages in memory
let messages = []; 

// When a user connects
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send the current messages when a new user connects
  socket.emit('message', messages);
  
  // Listen for new messages from clients
  socket.on('sendMessage', (newMessage) => {
    console.log("New message received:", newMessage); // Log the received message
    
    // Add timestamp to the new message
    const timestamp = new Date().toLocaleTimeString();
    
    // Assuming newMessage contains user info, add the timestamp
    const messageWithTimestamp = {
      ...newMessage,
      timestamp, // Add the timestamp to the message
    };

    // Store the message with timestamp in the server
    messages.push(messageWithTimestamp);
    
    // Emit the new message to all clients
    io.emit('message', messageWithTimestamp);
  });
  
  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Server listens on port 4000
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
