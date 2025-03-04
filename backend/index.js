const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/user');
const contributionRoutes = require('./routes/contributions');
const resetPasswordRoutes = require('./routes/resetPassword');
const express = require('express');
const app = express(); 



dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes); 
app.use('/api/contributions', contributionRoutes); 
app.use('/api/reset', resetPasswordRoutes)

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit if there's a connection error
  });