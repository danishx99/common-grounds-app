const Visitor = require('../models/Visitor');

exports.checkInVisitor = async (req, res) => {
  try {
    const { name, checkInTime, hostId } = req.body;
    const newVisitor = new Visitor({ name, checkInTime, hostId });
    await newVisitor.save();
    res.json({ message: 'Visitor checked in successfully', newVisitor });
  } catch (error) {
    console.error('Error checking in visitor:', error);
    res.status(500).json({ error: 'Error checking in visitor' });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.json({ message: 'Successfully got visitors', visitors });
  } catch (error) {
    console.error('Error getting visitors:', error);
    res.status(500).json({ error: 'Error getting visitors' });
  }
};

exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ message: 'Successfully got visitor', visitor });
  } catch (error) {
    console.error('Error getting visitor:', error);
    res.status(500).json({ error: 'Error getting visitor' });
  }
};

exports.updateVisitor = async (req, res) => {
  try {
    const { name, checkInTime, hostId, checkOutTime } = req.body;

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { name, checkInTime, hostId, checkOutTime }, // Update checkOutTime if provided
      { new: true }
    );
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ message: 'Successfully updated visitor', visitor });
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({ error: 'Error updating visitor' });
  }
};

exports.deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ error: 'Error deleting visitor' });
  }
};


exports.checkOutVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    visitor.checkOutTime = Date.now();
    await visitor.save();

    res.json({ message: 'Visitor checked out successfully', visitor });
  } catch (error) {
    console.error('Error checking out visitor:', error);
    res.status(500).json({ error: 'Error checking out visitor' });
  }
};
