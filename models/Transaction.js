const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be positive']
    },
    recipient: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true
    },
    purpose: {
        type: String,
        required: [true, 'Purpose is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Transaction', transactionSchema);