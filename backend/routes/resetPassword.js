const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const User = require('../models/User');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

// Generate a random password
function generateRandomPassword(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Send password reset email
function sendResetPasswordEmail(userEmail, newPassword) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'candyjessie2@gmail.com',
      pass: 'ysep jmor nhos fich',
    },
  });

  const mailOptions = {
    from: 'candyjessie2@gmail.com',
    to: userEmail,
    subject: 'Password Reset',
    text: `Your new temporary password is: ${newPassword}. Please log in and change your password as soon as possible.`,
  };

  return transporter.sendMail(mailOptions);
}

// Reset password endpoint
router.post("/reset-password/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new password
    const newPassword = generateRandomPassword();

    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save the hashed password to the user document
    user.password = hashedPassword;
    await user.save();

    // Send email with the new password
    await sendResetPasswordEmail(user.email, newPassword);

    res.status(200).json({ message: "Password reset successfully. Email sent." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
});

// Password update endpoint
router.put('/update-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Ensure currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const user = req.user; // The user should be attached to req by the authenticateUser middleware

    // Check if currentPassword matches the user's current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Save the new password
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
