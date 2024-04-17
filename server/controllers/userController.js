const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the current password with the hashed password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error changing password' });
  }
};

// Check if the user is an admin
exports.isAdmin = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const user = await User
        .findById(userId)
        .select('role');
        if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        }
    }
    
// Approve user onboarding
exports.approveOnboarding = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });
      res.status(200).json({ message: 'User onboarding approved', user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Remove user access
  exports.removeAccess = async (req, res) => {
    try {
      const { userId } = req.params;
      await User.findByIdAndDelete(userId);
      res.status(200).json({ message: 'User access revoked' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Change user permissions
  exports.changePermissions = async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
      res.status(200).json({ message: 'User permissions updated', user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };