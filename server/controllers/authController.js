const firebase = require("firebase/app");
const {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
} = require("firebase/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const validateEmail = require("../utils/emailUtils");
const transporter = require("../utils/mailer");

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyCtpyCzfGywbnGc4MQl3Sv_jDt_3JPSxl0",
  authDomain: "commongrounds-420608.firebaseapp.com",
  projectId: "commongrounds-420608",
  storageBucket: "commongrounds-420608.appspot.com",
  messagingSenderId: "940662765230",
  appId: "1:940662765230:web:71339aa44caa538d541f3f",
  measurementId: "G-3ZSK3L2G23",
};

firebase.initializeApp(firebaseConfig);
// Get the Firebase authentication instance
const auth = getAuth();

// Create a new Google authentication provider
const provider = new GoogleAuthProvider();

// Monitor user authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user);
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});

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
    console.log("Error registering user:", error);
    res.status(500).json({error: "Error registering user." + error});
  }
};

exports.loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    // Find the user by email
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({error: "Invalid credentials"});
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({error: "Invalid credentials"});
    }

    // Generate a JWT token and return it as a secure cookie
    const token = jwt.sign(
      {userId: user._id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: "24h"}
    );

    // Set token as an HttpOnly cookie
    res.cookie("token", token, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000}); // 24 hours

    // Return a success message
    res.json({success: true});

    //res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({error: "Error logging in user"});
  }
};

exports.loginWithGoogle = async (req, res) => {
  try {
    // Authenticate user with Google
    const userCredential = await firebase.signInWithPopup(auth, provider);
    const {user} = userCredential;

    // Check if the user already exists in the database
    let userDocument = await User.findOne({email: user.email});

    if (!userDocument) {
      // Create a new user in MongoDB
      userDocument = new User({
        name: user.displayName,
        email: user.email,
        role: "Resident", // Set the default role
        biometricData: {}, // Set any default biometric data
      });
      await userDocument.save();
    }

    // Generate a JWT token
    const token = jwt.sign(
      {userId: userDocument._id, role: userDocument.role},
      process.env.JWT_SECRET,
      {expiresIn: "24h"}
    );

    res.json({token});
  } catch (error) {
    console.error("Error logging in user with Google:", error);
    res.status(500).json({error: "Error logging in user with Google"});
  }
};

// Logout for future user management (Sprint 2 probably)
exports.logoutUser = async (req, res) => {
  try {
    await signOut(auth);
    res.clearCookie("token");
    res.json({success: true});
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({error: "Error logging out user"});
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
    const resetToken = jwt.sign(
      {userId: user._id, email: user.email},
      process.env.RESET_JWT_SECRET,
      {expiresIn: "1h"}
    );

    // Send the password reset email
    await transporter.sendMail({
      from: "noreply@yourapp.com",
      to: user.email,
      subject: "Password Reset Request",
      text: `
        Hello, ${user.name},

        We received a request to reset your password. If you did not make this request, please ignore this email.

        To reset your password, please click the following link:
        ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}

        This link will expire in 1 hour.

        Best regards,
        Your App Team
      `,
    });

    res.json({
      message: "Password reset instructions have been sent to your email",
    });
  } catch (error) {
    console.error("Error initiating password reset:", error);
    res.status(500).json({error: "Error initiating password reset"});
  }
  // try {
  //   const {email} = req.body;

  //   // Find the user by email
  //   const user = await User.findOne({email});

  //   if (!user) {
  //     return res.status(404).json({error: "User not found"});
  //   }

  //   // Generate a token for password reset
  //   const resetToken = jwt.sign({userId: user._id, email: user.email}, process.env.RESET_JWT_SECRET,{expiresIn: "1h"});

  //   // Send the resetToken to the client
  //   res.json({resetToken});
  // } catch (error) {
  //   console.error("Error initiating password reset:", error);
  //   res.status(500).json({error: "Error initiating password reset"});
  // }
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
