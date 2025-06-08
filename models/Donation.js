const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Donor must provide their name'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be positive'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Disturbed'],
    default: 'Pending',
  },
  imageString: {
    type: String,
    required: [true, 'Donor must upload transfer screenshot'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Donation', donationSchema);
