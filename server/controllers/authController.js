// Import necessary modules from the Firebase SDK
const firebase = require("firebase/app");
const {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} = require("firebase/auth");

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
      faceId,
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
          "Pease register with this Google account before attempting to login.",
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

    console.log(name, surname, email, role, code);

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

exports.registerFace = async (req, res) => {
  try {
    const image = req.body.image; // Assuming the image is sent in the request body

    const msDetectOptions = {
      host: process.env.FACE_API_HOST,
      method: "POST",
      port: 443,
      path: process.env.FACE_API_PATH_DETECT,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": Buffer.byteLength(image),
        "Ocp-Apim-Subscription-Key": process.env.FACE_API_KEY,
      },
    };

    console.log("1");


    const msDetectData = await new Promise((resolve, reject) => {
      const msDetectReq = https.request(msDetectOptions, (msDetectResponse) => {
        msDetectResponse.setEncoding("utf8");
        let msDetectData = "";
        msDetectResponse.on("data", (chunk) => {
          msDetectData += chunk;
        });
        msDetectResponse.on("end", () => {
          console.log("Face registered successfully");
          resolve(JSON.parse(msDetectData));
        });
      });

      msDetectReq.on("error", (error) => {
        reject(error);
      });

      msDetectReq.write(image);
      msDetectReq.end();
    });

    console.log("2")

    // Handle the response data
    if (msDetectData.error) {
      // Handle error
      console.error("Error registering face:", msDetectData.error);
      res.status(500).send(msDetectData.error);
    } else {
      // Handle success
      // Assuming the response contains a faceId
      const faceId = msDetectData.faceId;

      // Find the user in the database and update their faceId
      const user = await User.findById(req.user.id); // just confirm this is fine
      user.faceId = faceId;
      await user.save();

      res.status(200).send({ message: "Face registered successfully", faceId });
    }
  } catch (error) {
    // Handle any other errors
    res.status(500).send(error.message);
  }
};

// verify face endpoint calls this function
// still busy with this function
// exports.verifyFace = async (req, res) => {
//   try {
//     // this function takes in 2 face ID's & compares them-- do we have 2 face Id's tho?
//       const { faceId1, faceId2 } = req.body; // Assuming face IDs are sent in the request body

//       const verifyOptions = {
//           host: process.env.FACE_API_HOST,
//           method: 'POST',
//           port: 443,
//           path: process.env.FACE_API_PATH_VERIFY,
//           headers: {
//               'Content-Type': 'application/json',
//               'Ocp-Apim-Subscription-Key': process.env.FACE_API_KEY
//           }
//       };

//       const verifyData = await new Promise((resolve, reject) => {
//           const verifyReq = https.request(verifyOptions, (verifyResponse) => {
//               verifyResponse.setEncoding('utf8');
//               let verifyData = '';
//               verifyResponse.on('data', (chunk) => {
//                   verifyData += chunk;
//               });
//               verifyResponse.on('end', () => {
//                   resolve(JSON.parse(verifyData));
//               });
//           });

//           verifyReq.on('error', (error) => {
//               reject(error);
//           });

//           const verifyBody = JSON.stringify({
//               faceId1: faceId1,
//               faceId2: faceId2
//           });

//           verifyReq.write(verifyBody);
//           verifyReq.end();
//       });

//       // Handle the response data
//       if (verifyData.error) {
//           // Handle error
//           res.status(500).send(verifyData.error);
//       } else {
//           // Handle success
//           res.status(200).send(verifyData);
//       }
//   } catch (error) {
//       // Handle any other errors
//       res.status(500).send(error.message);
//   }
// };

// Verify face endpoint calls this function

exports.verifyFace = async (req, res) => {
  const { name, surname, faceId, image } = req.body;

  // Validate input: either faceId or an image is required
  if (!faceId && !image) {
    return res
      .status(400)
      .json({ message: "Either faceId or image is required" });
  }

  // Find user by name & surname
  const user = await User.findOne({
    name: { $regex: new RegExp(name, "i") },
    surname: { $regex: new RegExp(surname, "i") },
  }).select("username faceId");

  if (!user) {
    return res.status(403).json({ message: "User not found" });
  }

  let faceIdToVerify;
  if (faceId) {
    faceIdToVerify = faceId;
  } else {
    // Convert image to binary data
    const imageData = Buffer.from(image.split(",")[1], "base64"); // must double check this image size is not too large
    // Detect faces in the image
    const detectedFaces = await faceApi.detect(imageData);
    if (detectedFaces.length !== 1) {
      return res
        .status(400)
        .json({ message: "Exactly one face must be detected in the image." });
    }
    faceIdToVerify = detectedFaces[0].faceId;
  }

  // Verify face ID
  const verificationResult = await faceApi.verify(user.faceId, faceIdToVerify);
  if (
    !verificationResult.isIdentical ||
    verificationResult.confidence < process.env.FACE_API_CONFIDENCE_TRESHOLD
  ) {
    return res.status(403).json({ message: "Face verification failed." });
  }

  // Generate JWT token, ask for second opinion on this because they signed & returned as cookie
  // const token = jwt.sign({ username: user.username }, config.SECRET);
  // return res.json({ message: 'Login successful', token });
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

      
      
  

