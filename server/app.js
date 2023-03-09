import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();

// Connect to MongoDB using Mongoose
mongoose.connect(
  // I know this thing should be in .env file but for now it is as it is...
  'mongodb+srv://rajatsharma:UFOkfEJXczw6wfwR@cluster0.4zaoakv.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB database');
});

// Define a Mongoose schema for the User collection
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  invitationCode: { type: String, required: true },
  imageUrls: { type: [String] },
  createdAt: { type: Date, default: Date.now },
});

// Define a Mongoose model for the User collection
const User = mongoose.model('User', UserSchema);

// Middleware for parsing JSON request body
app.use(express.json());

// Middleware for enabling CORS
app.use(cors());

// API endpoint for creating a new user
app.post('/api/users', async (req, res) => {
  const { name, email, invitationCode } = req.body;
  try {
    const newUser = new User({ name, email, invitationCode });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// API endpoint for getting all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

// API endpoint for adding image URLs to a user
app.put('/api/users/:id/images', async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  try {
    const user = await User.findById(id);
    user.imageUrls.push(imageUrl);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error adding image URL to user' });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
