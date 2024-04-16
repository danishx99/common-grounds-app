const firebase = require('firebase/app');
require('firebase/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const validateEmail = require('../utils/emailUtils');

dotenv.config();

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      password,
      confirmPassword,
      email,
      role,
      biometricData,
    } = req.body;

    // Validate the email
    const isValidEmail = await validateEmail(email);

    if (!isValidEmail) {
      return res.status(400).json({error: "Please provide a valid email"});
    }

    // Check if the user is already existing
    const existing = await User.findOne({email});
    if (existing) {
      return res.status(400).json({error: "User already exists"});
    }

    // Verify if the password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({error: "Passwords do not match"});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    


    // Create a new user
    const newUser = new User({
      name,
      surname,
      password: hashedPassword,
      email,
      role,
      biometricData,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({message: "User registered successfully"});
  } catch (error) {
    console.log('Error registering user:', error);
    res.status(500).json({ error: "Error registering user." + error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token and return it as a secure cookie
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Set token as an HttpOnly cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours

    // Return a success message
    res.json({ success: true });





   //res.json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Error logging in user' });
  }
};

exports.loginWithFirebase = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user with Firebase
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const { user } = userCredential;

    // Retrieve user data from MongoDB
    let userDocument = await User.findOne({ firebaseUserId: user.uid });

    if (!userDocument) {
      // Create a new user in MongoDB
      userDocument = new User({
        firebaseUserId: user.uid,
        username: user.displayName,
        email: user.email,
        role: 'Resident', // Set the default role
        biometricData: {} // Set any default biometric data
      });
      await userDocument.save();
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: userDocument._id, role: userDocument.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    console.error('Error logging in user with Firebase:', error);
    res.status(500).json({ error: 'Error logging in user with Firebase' });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const {email} = req.body;

    // Find the user by email
    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Generate a token for password reset
    const resetToken = jwt.sign({userId: user._id, email: user.email}, process.env.RESET_JWT_SECRET,{expiresIn: "1h"});
    
    // Send the resetToken to the client
    res.json({resetToken});
  } catch (error) {
    console.error("Error initiating password reset:", error);
    res.status(500).json({error: "Error initiating password reset"});
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const {resetToken, newPassword, confirmPassword} = req.body;

    // Verify if the newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({error: "Passwords do not match"});
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.RESET_JWT_SECRET);

    // Find the user by email
    const user = await User.findOne({email: decoded.email});

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({message: "Password reset successfully"});
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({error: "Error resetting password"});
  }
};
