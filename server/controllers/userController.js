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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({ message: "Successfully got all users", users: users });
  } catch (error) {
    console.log("Error getting all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logged in user information
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
    console.log("Error getting user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user information/Manage Users

exports.manageUsers = async (req, res) => {
  try {
    const { userCode, role, del } = req.body;

    //Check if delete is true, if it is, delete the user
    if (del == true) {
      await User.findOneAndDelete({ userCode });
      return res.status(200).json({ message: "User deleted successfully" });
    }

    //Update user permissions, will only run if delete is not true
    const userToUpdate = await User.findOne({ userCode });

    //update the user role
    userToUpdate.role = role;

    //update the userCode so that the prefix becomes the new role, "Admin65738" -> "Staff65738"
    // Split the old code into an array based on the separator
    let parts = userToUpdate.userCode.split(/(\d+)/);

    userToUpdate.userCode = role + parts[1];
    


    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User permissions updated", user: userToUpdate });
  } catch (error) {
    console.log("Error managing user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Route to get user details, given a user code

exports.getUserByUserCode = async (req, res) => {
  try {
    const { userCode } = req.body;
    const user = await User.findOne({ userCode }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User found", user: user });

  } catch (error) {
    console.log("Error getting user by user code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 
}

