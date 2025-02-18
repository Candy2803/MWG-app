const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// app.get('/', (req, res) => {
//   res.send('Server is running ....');
// });

// app.get('/home', (req, res) => {
//   res.send('Welcome to the home page!');
// })

