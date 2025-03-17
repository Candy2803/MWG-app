const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  userName: {
    type: String,
    required: true, 
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'mpesa'
  },
  contributionDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

ContributionSchema.pre('save', async function (next) {
  if (this.isModified('userId')) {
    const user = await mongoose.model('User').findById(this.userId);
    if (user) {
      this.userName = user.name;
    }
  }
  next();
});

module.exports = mongoose.model('Contribution', ContributionSchema);
