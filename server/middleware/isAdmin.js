const User = require('../models/User');

// Check if the user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User
    .findById(userId)
    .select('role');
    if (user.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  }
  catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
