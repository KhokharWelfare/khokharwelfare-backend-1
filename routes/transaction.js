const express = require('express');
const Transaction = require('../models/Transaction');
const {authMiddleware, adminMiddleware} = require('../middleware/auth');
const router = express.Router();



router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try{
        const {amount, recipient, purpose} = req.body;
        if(!amount || !recipient || !purpose) {
            return res.status(400).json({message: 'Please provide all the fields'});
        }
        const transaction = new Transaction({
            recipient,
            purpose,
            amount
        });
        await transaction.save();

        res.status(201).json({transaction});
    }catch(err){
        res.status(500).json({message: 'Server error'});
    }
});

router.get('/', async (req, res) => {
    try{
        const transactions = await Transaction.find().sort({createdAt: -1});
        res.status(201).json({transactions});
    }catch(err){
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;
