const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Internal helper for auth
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'supersecret');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// 1. Register User (Create)
app.post('/api/register', async (req, res) => {
  try {
    const { name, mobile, email, password, dob, address, city, gender, hobbies } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already registered.' });
    }

    // Explicitly validate password logic since it gets hashed before model save
    const passRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[#@$]).{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be min 8 characters, contain at least 1 capital letter, 1 digit, and 1 special character (#, @, or $).' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name, mobile, email, password: hashedPassword, dob, address, city, gender, hobbies
    });

    await user.save();
    
    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Login User (Authenticate)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    
    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Show User Data (Read)
app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Update User Data (Update)
app.put('/api/user/profile', authenticate, async (req, res) => {
  try {
    // Only extract updatable fields, ignoring password/email changes for simplicity
    const { name, mobile, dob, address, city, gender, hobbies } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { name, mobile, dob, address, city, gender, hobbies },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ass3b_auth')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));
