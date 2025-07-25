const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donation');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transaction');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Use the correct domain (spelling fix) and proper CORS setup
//const allowedOrigins = [
//  'https://khokharwelfarefoundaion.com',
//  'https://www.khokharwelfarefoundaion.com',
//  'http://localhost:3000',
//];

 const allowedOrigins = [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "https://example.co",
      "https://www.exaple.co",
      "https://www.khokharwelfarefoundaion.com",
      "https://khokhar-welfare-frontend.vercel.app",
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ Handle preflight requests before routes
app.options("*", cors(corsOptions));

// ✅ Apply CORS
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // important!
  }

  next();
});



// Middleware: Use cors package with options
// app.use(
//   cors({
//     origin: "*"
//   })
// );

app.use(express.json()); // Parse JSON request bodies

// Middleware: Set headers manually for CORS
//app.use((req, res, next) => {
//  const origin = req.headers.origin;
//  if (allowedOrigins.includes(origin)) {
    // res.header('Access-Control-Allow-Origin', origin);
  // }
  // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // res.header('Access-Control-Allow-Credentials', 'true');
  // if (req.method === 'OPTIONS') {
    // return res.sendStatus(204);
  // }
  // next();
// });

mongoose.set('strictQuery', true);
// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Define APIs
app.use('/api/auth', authRoutes); // Authentication routes (login, register)
app.use('/api/donation', donationRoutes); // Donation routes (add, view)
app.use('/api/transaction', transactionRoutes); // Transaction routes (track fund usage)
app.use('/api/admin', adminRoutes); // Admin routes (manage donations, users)

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('Family Welfare Website Running.');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
