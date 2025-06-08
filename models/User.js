const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'User must provide their name'],
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/,'Please enter a valid email'],
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be atleast 6 characters'],
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

module.exports = mongoose.model('User', userSchema);
