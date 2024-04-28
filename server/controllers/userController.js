const User = require("../models/User");
const { hashPassword } = require("../utils/passwordUtils");
const jwt = require("jsonwebtoken");

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the current password with the hashed password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Error changing password" });
  }
};

// Approve user onboarding (Depends on how we gonna do it not needed for now)
// exports.approveOnboarding = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });
//     res.status(200).json({ message: 'User onboarding approved', user });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// Remove user access
exports.removeAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User access revoked" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change user permissions
exports.changePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.status(200).json({ message: "User permissions updated", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all users (or with filters)
exports.getUsers = async (req, res) => {
  const { name, email, role } = req.query; // Get filters from query parameters (optional)

  const filters = {};
  if (name) filters.name = { $regex: name, $options: "i" }; // Case-insensitive name search
  if (email) filters.email = email;
  if (role) filters.role = role;

  const users = await User.find(filters);
  res.json(users);
};

// Detailed user information
exports.getUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userCode = decoded.userCode;

    const user = await User.find({ userCode }).select("-password"); // Exclude password from response

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Successfully got user details", user: user });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
