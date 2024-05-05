const Fine = require('../models/Fine');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.issueFine = async (req, res) => {
  try {
    const { userCode, title, description, amount } = req.body;

    //get Current logged in user
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const issuedBy = decoded.userCode;

    // Check if user exists
    const userToFine = await User.findOne({ userCode });
    if (!userToFine) {
      return res.status(404).json({ error: 'User not found' });
    }


    const newFine = new Fine({title, amount, description, issuedBy, issuedTo: userCode});
    await newFine.save();

    res.status(200).json({ message: 'Fine issued successfully' });


  } catch (error) {
    console.error('Error issuing fine:', error);
    res.status(500).json({ error: 'Error issuing fine' });
  }
};
