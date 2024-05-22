// Import necessary modules from the Firebase SDK

// require('@tensorflow/tfjs-node'); // ig we kinda need this so find a way to make it work
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const path = require('path');


// console.log(faceapi.nets);
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const dotenv = require("dotenv"); // For accessing environment variables
const User = require("../models/User"); // Importing User model
const Code = require("../models/Code"); // Importing Code model
const validateEmail = require("../utils/emailUtils"); // Utility function for email validation
const valPassComplexity = require("../utils/passwordUtils"); // Importing utility function for password complexity validation
const transporter = require("../utils/mailer"); // Transporter for sending emails
// http for making external requests to Face API
var http = require("http");
var https = require("https");

dotenv.config();

// const firebaseConfig = {
//   apiKey: "AIzaSyCtpyCzfGywbnGc4MQl3Sv_jDt_3JPSxl0",
//   authDomain: "commongrounds-420608.firebaseapp.com",
//   projectId: "commongrounds-420608",
//   storageBucket: "commongrounds-420608.appspot.com",
//   messagingSenderId: "940662765230",
//   appId: "1:940662765230:web:71339aa44caa538d541f3f",
//   measurementId: "G-3ZSK3L2G23",
// };

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      password,
      confirmPassword,
      email,
      role,
      code,
      userImage,
    } = req.body;

    // Validate the email
    const isValidEmail = await validateEmail(email);

    if (!isValidEmail) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }

    // Check if the user is already existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ error: "A user with this email address already exists." });
    }

    // Verify if the password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate the password complexity
    const isValidPassword = await valPassComplexity.checkPassword(password);

    //console.log(isValidPassword)

    if (!isValidPassword) {
      return res.status(400).json({
        error:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
      });
    }

    //Check if code is valid
    const codeCheck = await Code.findOne({ userCode: code });

    if (!codeCheck) {
      return res
        .status(400)
        .json({
          error:
            "Invalid code. Please contact management for further assistance",
        });
    }

    //Check for mismatch between account role and type of code provided
    if (role != codeCheck.role) {
      return res
        .status(400)
        .json({ error: "Account type and provided code do not match." });
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
      userCode: code,
      faceId,
    });

    // Save the new user to the database
    await newUser.save();

    //Delete the code because it has been used

    await Code.deleteOne({ userCode: code });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).json({ error: "Error registering user." + error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token and return it as a secure cookie
    const token = jwt.sign(
      { userCode: user.userCode, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as an HttpOnly cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours

    // Return a success message
    res.json({ success: true, redirect: user.role });

    //res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Error logging in user" });
  }
};

exports.loginWithGoogle = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error:
          "Please register with this Google account before attempting to login.",
      });
    }

    // Generate a JWT token and return it as a secure cookie
    const token = jwt.sign(
      { userCode: user.userCode, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as an HttpOnly cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours

    // Return a success message
    res.json({ success: true, redirect: user.role });

    //res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Error logging in user" });
  }
};

exports.registerWithGoogle = async (req, res) => {
  try {
    const { name, surname, email, role, code } = req.body;

    // console.log(name, surname, email, role, code);

    // Find the user by email
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        error:
          "This account already exists. Please login using this account instead.",
      });
    }

    //Check if code is valid
    const codeCheck = await Code.findOne({ userCode: code });

    if (!codeCheck) {
      return res
        .status(400)
        .json({
          error:
            "Invalid code. Please contact management for further assistance",
        });
    }

    //Check for mismatch between account role and type of code provided
    if (role != codeCheck.role) {
      return res
        .status(400)
        .json({ error: "Account type and provided code do not match." });
    }

    // Create a new user with the Google account details
    const newUser = new User({
      name,
      surname,
      email,
      role,
      userCode: code,
    });

    // Save the new user to the database
    await newUser.save();

    //Delete the code because it has been used

    await Code.deleteOne({ userCode: code });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Error logging in user" });
  }
};

// Logout for future user management (Sprint 2 probably)
exports.logoutUser = async (req, res) => {
  try {
    await signOut(auth);
    res.clearCookie("token");
    res.json({ success: true });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ error: "Error logging out user" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate the email

    const isValidEmail = await validateEmail(email);

    if (!isValidEmail) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.RESET_JWT_SECRET,
      { expiresIn: "1h" }
    );

    var url = req.protocol + "://" + req.get("host");

    // Send the password reset email
    let mail = await transporter.sendMail({
      from: "noreply@yourapp.com",
      to: user.email,
      subject: "Password Reset Request",
      text: `
        Hello ${user.name},

        We received a request to reset your password. If you did not make this request, please ignore this email.

        To reset your password, please click the following link:
        ${url}/reset-password?token=${resetToken}

        This link will expire in 1 hour.

        Best regards,
        Commongrounds Admin Team
      `,
    });

    console.log(
      `Email to reset password sent to ${user.email}: ${mail.messageId}`
    );

    res.json({
      message: "Password reset instructions have been sent to your email",
    });
  } catch (error) {
    console.error("Error initiating password reset:", error);
    res.status(500).json({ error: "Error initiating password reset" });
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
    const { resetToken, password, confirmPassword } = req.body;

    console.log("Reset token : " + resetToken);

    // Verify if the newPassword and confirmPassword match
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate the password complexity
    const isValidPassword = await valPassComplexity.checkPassword(password);

    if (!isValidPassword) {
      return res.status(400).json({
        error:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
      });
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.RESET_JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid reset token" });
    }

    // Find the user by email
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's password
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Send the password reset email
    let mail = await transporter.sendMail({
      from: "noreply@yourapp.com",
      to: user.email,
      subject: "Password Reset Successful",
      text: `
        Hello ${user.name},

        Your password has been successfully reset.

        If you did not make this request, please contact us immediately.

        Best regards,
        Commongrounds Admin Team
        

      `,
    });

    console.log(
      `Email confirming password reset sent to ${user.email}: ${mail.messageId}`
    );

    //console.log("Hi")

    // //redirect to login page

    res.json({ message: "Password reset successfully" });

    // res.status(302).setHeader('Location', '/login').end();
  } catch (error) {
    console.log("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
};

// Register face endpoint calls this function

exports.registerFace = async(req, res)=>{
  console.log("Registering face");
  // image is a  base64 string
  const { image} = req.body;

  await Promise.all([
    // Load the model weights from a local file
    faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.ageGenderNet.loadFromDisk(path.join(__dirname, '../face-models')),
])
  //get Current logged in user
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currUserCode = decoded.userCode;

  // Check if user exists
  const userToUpdate = await User.findOne({ userCode: currUserCode });

  if (!userToUpdate) {
    return res.status(404).json({ error: "User not found" });
  }
  //  console.log(image);
//   var actualImage = new Image();

// // Define the onload handler
// actualImage.onload = function() {
//   console.log("Image loaded successfully.");
//   // Resolve the promise here if needed
// };

// // Define the onerror handler
// actualImage.onerror = function() {
//   console.error("Failed to load image.");
//   // Handle error appropriately
// };

// // Set the src attribute after defining the handlers
// // Also, check if the image is already loaded or not
// if (!actualImage.complete || actualImage.naturalHeight === 0) {
//   actualImage.src = await image; // Assuming 'image' is a valid Base64 string
// } else {
//   console.warn("Image is already loaded or invalid.");
// }

// // Wait for the image to finish loading
// await new Promise((resolve, reject) => {
//   actualImage.onload = resolve;
//   actualImage.onerror = reject;
// });
// actualImage= Buffer.from(image, 'base64').toString('binary');
return res.json({ message: "Facial authentication failed successfully" });

// grab face & send data to detectFaces method  
  let imageAIData= await faceapi.detectSingleFace(actualImage).withFaceLandmarks().withFaceDescriptor();

  

  if(!imageAIData){
    return res.status(404).json({ error: "No face detected" });
      
  }
  // update userImage
  console.log("A face detected");
  userToUpdate.userImage= actualImage;
  res.status(200).json({ message: "Facial authentication set up successfully" });
  
};


// Verify face endpoint calls this function

exports.verifyFace = async(req,res)=>{
  console.log("Verifyiing face ...");
  const { image, email} = req.body;
// should probably chnage from loading from uri to loading from disk
  await Promise.all([
     // Load the model weights from a local file
    faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../face-models')),
    faceapi.nets.ageGenderNet.loadFromDisk(path.join(__dirname, '../face-models')),
  ])

  const user= await User.findOne({email});
  // grab face & send data to detectFaces method
  if(!user){
    return res.status(404).json({ error: "User not found" });
  }
  if(!user.userImage){
    return res.status(404).json({ error: "User has not registered a face" });
  }
  const facesToCheckImage = user.userImage;

// first decode image from base64 string
  let refImageAIData= await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
  let facesToCheckImageAIData= await faceapi.detectAllFaces(facesToCheckImage).withFaceLandmarks().withFaceDescriptors();

  // here we make a face matcher of the reference image & compare that to the face we want to check
  let faceMatcher= new faceapi.FaceMatcher(refImageAIData);
  facesToCheckImageAIData= faceapi.resizeResults(facesToCheckImageAIData, facesToCheckImage);
  
  facesToCheckImageAIData.forEach(face=>{
      
      const {descriptor, detection}= face;

      // make a label using the default 
      let label= faceMatcher.findBestMatch(descriptor).toString();
      console.log(label);

      // If the face belongs to the person (not "unknown")
  if (!label.includes("unknown")) {
      // login user
      console.log("User logged in.");
      // Generate a JWT token and return it as a secure cookie
    const token = jwt.sign(
      { userCode: user.userCode, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as an HttpOnly cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours

    // Return a success message
    res.json({ success: true, redirect: user.role });

      
  } else {
      alert('Face did not match. Please try again.');
  }
  })
  

};

//generate code for user registration

exports.generateCode = async (req, res) => {
  try {
    const { role } = req.body;

    //Generate a random 5 digit code and prefix it with the role
    const code = role + Math.floor(10000 + Math.random() * 90000);

    console.log("Generated code: ", code);

    //Store code along with role in the database

    const newCode = new Code({
      userCode: code,
      role,
    });

    await newCode.save();

    res.json({ message: code });
  } catch (error) {
    console.log("Error generating code:", error);
    res.status(500).json({ error: "Error generating code" });
  }
}

//generate password for visitors
exports.generateVisitorPassword = async (req, res) => {
  
    try {
      const token = req.cookies.token;

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      let userCode = verified.userCode;

      //Find the user corresponding to this user code

      const user = await User.findOne({ userCode });


      //Check how much time is left
      var millisecondsInAnHour = 3600000;

      // Calculate time left in milliseconds
      var timeLeftInMilliseconds = 86400000 - (Date.now() - user.visitorPasswordCreatedAt);

      // Convert milliseconds to hours
      var timeLeftInHours = timeLeftInMilliseconds / millisecondsInAnHour;

      // Round to the nearest half hour
      var timeLeftInHalfHours = Math.round(timeLeftInHours * 2) / 2;

      //Check if password has been generated in the last 24 hours
      if (user.visitorPassword && (Date.now() - user.visitorPasswordCreatedAt) < 86400000) {
        return res.status(400).json({ message: `See visitor password below. It remains valid for about ${timeLeftInHalfHours} more hours.`, password: user.visitorPassword});
      }

      //A visitor password has already been generated recently. Please note that it remains valid for 24 hours from its initial generation.

      //Generate a 5 digit password for the visitor
      const password = Math.floor(10000 + Math.random() * 90000);

      //Store the password and current date/time in the user's record
      user.visitorPassword = password;
      user.visitorPasswordCreatedAt = Date.now();

      await user.save();

      res.json({ password : password });

    } catch (error) {
      console.log("Error generating visitor password:", error);
      res.status(500).json({ error: "Error generating visitor password" });
    }

}

      
      
  

