const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // For password hashing


const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    password: { type: String, required: true },
    profileImage: { type: String, default: null }, // URL to user's profile image
    isApproved: { type: Boolean, default: false },
    passwordResetToken: { type: String, default: null }, // For password reset flow
    passwordResetExpiry: { type: Date, default: null }, // Expiry for the reset token
  },
  { timestamps: true }
);

// Password reset functionality validation
UserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
