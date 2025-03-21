const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const jwt = require('jsonwebtoken');

const router = express.Router();



router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});


const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
// In your routes file (for example, userRoutes.js)
router.put('/:id', async (req, res) => {
  try {
    const { profileImage, ...otherFields } = req.body;
    
    // Update user with profile image
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        ...otherFields,
        profileImage // Ensure profileImage is included in update
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Error updating user", error: error.message });
  }
});

// Remove the duplicate PUT route and keep only this one
router.put('/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Log the update attempt
    console.log("Attempting to update user:", id);
    console.log("Update data:", updateData);

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!user) {
      console.log("User not found:", id);
      return res.status(404).send({ message: 'User not found' });
    }

    console.log("User updated successfully:", user);
    res.status(200).send({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ 
      message: "Error updating user", 
      error: error.message 
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const contributions = await Contribution.find({ userId: req.params.id });

    res.status(200).send({ user, contributions });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching user data', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    await Contribution.deleteMany({ userId: req.params.id });

    const mailOptions = {
      from: 'your-email@gmail.com', 
      to: user.email, 
      subject: 'ACCOUNT DELETED',
      text: `Dear ${user.name},\n\nYour account has been deleted by the admin. You will no longer be able to access your account.\n\nBest regards,\nMWG Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send({ message: 'Account deleted, but email failed to send', error });
      } else {
        console.log('Deletion email sent:', info.response);
      }
    });

    res.status(200).send({ message: 'User and contributions deleted, email sent', user });
  } catch (error) {
    res.status(500).send(error);
  }
});


router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const contributions = await Contribution.find({ userId: req.params.id });

    res.status(200).send({ user, contributions });
  } catch (error) {
    res.status(500).send(error);
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service you want to use
  auth: {
    user: 'mwarighaswelfare@gmail.com', // Your email address
    pass: 'yock vqdb gwod vbf', // Your email password or app-specific password
  },
});


router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if all fields are provided
  if (!name || !email || !phone || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isApproved: false, // Default to false until admin approval
    });

    // Save user to the database
    const savedUser = await user.save();

    // Create an initial contribution record (if necessary)
    const contribution = new Contribution({
      userId: savedUser._id,
      userName: savedUser.name,  // Pass the user name
      amount: 0,
      paymentMethod: 'mpesa',  // Set a valid default payment method (based on enum values)
    });

    await contribution.save();

    const mailOptions = {
      from: 'mwarighaswelfare@gmail.com', 
      to: email, 
      subject: 'ACCOUNT CREATED SUCCESSFULLY - AWAITING APPROVAL',
      text: `Dear ${name},\n\nYour account has been created successfully and is awaiting approval from the admin. You will be notified once your account is approved.\n\nBest regards,\nMWG Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    const admin = await User.findOne({ role: 'admin' });
    if (admin?.expoPushToken) {
      await sendPushNotification(
        admin.expoPushToken,
        'New User Registration',
        `${name} has registered and is awaiting approval`
      );
    }

    res.status(201).send({ message: 'User registered successfully, pending admin approval', user: savedUser, contribution });
  } catch (error) {
    console.error('Error during registration:', error.message); // Log error for debugging
    res.status(500).send({ message: 'Signup failed', error: error.message });
  }
});





router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    if (!user.verifyPassword(password)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If password is correct, create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the user and token in the response
    res.json({ user, token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});





router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });

    if (user) {
      const mailOptions = {
        from: 'mwarighaswelfare@gmail.com', 
        to: user.email, 
        subject: 'ACCOUNT APPROVED',
        text: `Dear ${user.name},\n\nYour account has been approved by the admin. You can now log in to your account and start using the platform.\n\nBest regards,\nMWG Team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send({ message: 'Account approved, but email failed to send', error });
        } else {
          console.log('Approval email sent:', info.response);
        }
      });
    }

    res.json({ message: 'User approved and email sent', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve user', error });
  }
});

router.get('/loginadmin/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); 

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const contributions = await Contribution.find({ userId: req.params.id });

    res.status(200).send({ message: 'User impersonation data', user, contributions });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error });
  }
});

router.post('/:userId/contributions', async (req, res) => {
  try {
    const { userId } = req.params; 
    const { amount, paymentMethod } = req.body;

    console.log('Received userId:', userId); 
    console.log('Received request body:', req.body); 

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found'); 
      return res.status(404).send({ message: 'User not found' });
    }

    const contribution = new Contribution({
      userId,
      amount,
      paymentMethod,
    });

    console.log('Contribution object:', contribution); 

    await contribution.save();

    res.status(201).send({ message: 'Contribution added successfully', contribution });
  } catch (error) {
    console.error('Error adding contribution:', error); 
    res.status(500).send({ message: 'Error adding contribution', error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    // Fetch all users from your database.
    const users = await User.find();

    if (users.length === 0) {
      return res.status(200).send({ message: "No users found", users: [] });
    }

    // For each user, fetch their transactions from the M-PESA endpoint
    // and calculate the total amount.
    const usersWithTotals = await Promise.all(
      users.map(async (user) => {
        try {
          // Fetch the transactions for the user.
          const response = await axios.get(
            `https://mpesa-c874.vercel.app/api/mpesa/transactions/${user._id}?t=${Date.now()}`
          );
          // Assume the transactions are in response.data.data.
          const transactions = response.data.data || [];
          // Sum the amounts.
          const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
          return {
            _id: user._id,
            userName: user.name,
            totalContributions: total,
          };
        } catch (err) {
          console.error(`Error fetching transactions for user ${user._id}:`, err.message);
          // If fetching transactions fails for a user, default the total to 0.
          return {
            _id: user._id,
            userName: user.name,
            totalContributions: 0,
          };
        }
      })
    );

    console.log("Fetched users with totals:", usersWithTotals);
    res.status(200).send({
      message: "Users with transaction totals fetched successfully",
      users: usersWithTotals,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).send({
      message: "Error fetching users and their transaction totals",
      error: error.message,
    });
  }
});


module.exports = router;
