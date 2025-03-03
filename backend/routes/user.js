const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const Contribution = require('../models/Contribution');

const router = express.Router();

// Setting up nodemailer transport for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'candyjessie2@gmail.com', // Your email address
    pass: 'ysep jmor nhos fich', // Your email password or app-specific password
  },
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: 'Please provide your email address.' });
  }

  try {
    // Find the user with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User with this email does not exist.' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    // Save the reset token and expiration date in the user's record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

    // Send a reset email with the token (included in the link)
    const resetLink = `http://your-app.com/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'candyjessie2@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, please click on the following link:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Password reset link has been sent to your email address.' });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    res.status(500).send({ message: 'Error processing the request' });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).send({ message: 'Please provide a new password.' });
  }

  try {
    // Find the user based on the reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token has not expired
    });

    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired password reset token.' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration date
    await user.save();

    res.status(200).send({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).send({ message: 'Error resetting the password.' });
  }
});

// Register Route
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
      from: 'your-email@gmail.com', 
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

    res.status(201).send({ message: 'User registered successfully, pending admin approval', user: savedUser, contribution });
  } catch (error) {
    console.error('Error during registration:', error.message); // Log error for debugging
    res.status(500).send({ message: 'Signup failed', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    // If the user is an admin or already approved, skip the approval check.
    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).send({ message: 'User not approved by admin' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const contributions = await Contribution.find({ userId: user._id });

    res.status(200).send({ message: 'Login successful', user, contributions });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error });
  }
});

// Update User Approval Route
router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });

    if (user) {
      const mailOptions = {
        from: 'your-email@gmail.com', 
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

// Delete User Route
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    await Contribution.deleteMany({ userId: req.params.id });

    // Send email notification about account deletion
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

module.exports = router;
