const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
// exports.verifyToken = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({error: "No authorization token provided"});
//     }

//     const [bearer, token] = authHeader.split(" ");
//     if (bearer !== "Bearer") {
//       return res
//         .status(401)
//         .json({error: "Invalid authorization token format"});
//     }

//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = verified.userId;
//     req.userRole = verified.role;
//     next();
//   } catch (error) {
//     console.error("Error authenticating user:", error);
//     res.status(401).json({error: "Invalid token"});
//   }
// };

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({error: "You are not authorized to access this resource(no token)"});
    }


    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verified.userId;
    req.userRole = verified.role;

   
    next();
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({error: "Invalid token"});
  }
};


exports.verifyResetToken = (req, res, next) => {
  try {
    const resetToken = req.body.resetToken;
    const decoded = jwt.verify(resetToken, process.env.RESET_JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(401).json({error: "Invalid reset token"});
  }
};
