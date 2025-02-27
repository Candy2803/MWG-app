const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false } 
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
