const Fine = require("../models/Fine");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.getFines = async (req, res) => {
  try {
    //find all fines and show unpaid fines on top , and then sort by newest to oldeest
    const fines = await Fine.find().sort({ isPaid: 1, dateIssued: -1 });
    res.status(200).json({ message: "Successfully got fines", fines: fines });
  } catch (error) {
    console.error("Error fetching fines:", error);
    res.status(500).json({ error: "Error fetching fines" });
  }
};

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
      return res.status(404).json({ error: "User not found" });
    }

    const newFine = new Fine({
      title,
      amount,
      description,
      issuedBy,
      issuedTo: userCode,
    });
    await newFine.save();

    res.status(200).json({ message: "Fine issued successfully" });
  } catch (error) {
    console.error("Error issuing fine:", error);
    res.status(500).json({ error: "Error issuing fine" });
  }
};

exports.updateFineStatus = async (req, res) => {
  try {
    const { fineId } = req.body;

    // Check if fine exists
    const fine = await Fine.findById(fineId);

    fine.isPaid = true;
    await fine.save();

    res.status(200).json({ message: "Fine status updated successfully" });
  } catch (error) {
    console.error("Error updating fine status:", error);
    res.status(500).json({ error: "Error updating fine status" });
  }
};

exports.getUserFines = async (req, res) => {
  try {
    //get Current logged in user
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userCode = decoded.userCode;

    const fines = await Fine.find({ issuedTo: userCode }).sort({
      dateIssued: -1,
    });

    fines.forEach((fine) => {
      fine.isRead = true;
      fine.save();
    });

    res
      .status(200)
      .json({ message: "Successfully got user fines", fines: fines });
  } catch (error) {
    console.error("Error fetching user fines:", error);
    res.status(500).json({ error: "Error fetching user fines" });
  }
};

exports.hasUnreadFines = async (req, res) => {
  try {
    //get Current logged in user
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userCode = decoded.userCode;

    const fines = await Fine.find({ issuedTo: userCode, isRead: false });

    res.status(200).json({ unreadFines: fines.length });
  } catch (error) {
    console.error("Error fetching unread fines:", error);
    res.status(500).json({ error: "Error fetching unread fines" });
  }
};
