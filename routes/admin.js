const express = require('express');
const Donation = require('../models/Donation');
const User = require('../models/User');
const {authMiddleware, adminMiddleware} = require('../middleware/auth');
const router = express.Router();

const cors = require('cors');
app.use(cors({
  origin: ['https://khokhar-welfarefoundation.vercel.app', 'https://www.khokharwelfarefoundaion.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Get all donations (admin only);
router.get('/donations', authMiddleware, adminMiddleware, async(req, res) => {
    try{
        const donations = await Donation.find().sort({ createdAt: -1});
        res.json(donations);
    }catch(err){
        res.status(500).json({message: 'Server Error'});
    }
})

// Update donation status (admin only);
router.patch('/donations/:id', authMiddleware, adminMiddleware, async(req, res) => {
    const {status} = req.body;
    try{
        if(!['Pending', 'Disturbed'].includes(status)){
            return res.status(400).json({message: 'Invalid request'});
        }
        const donation = await Donation.findByIdAndUpdate(
  req.params.id,
  { status },
  { new: true }
);
        if(!donation)return res.status(404).json({message: 'Donation not found'});
        res.json(donation);
    }catch(err){
        res.status(500).json({message: 'Server Error'});
    }
});

// Get all Users (admin only);
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try{
        const users = await User.find().select('-password');
        res.json(users);
    }catch(err){
        res.status(500).json({message: 'Server Error'});
    }
});

module.exports = router;
