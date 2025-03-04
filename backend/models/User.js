const mongoose = require('mongoose');

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
UserSchema.methods.createPasswordResetToken = function () {
  // Assuming you would use `crypto` to generate a token in the controller
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = resetToken;
  this.passwordResetExpiry = Date.now() + 3600000; // Token expires in 1 hour
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
