const Visitor = require('../models/Visitor');

exports.createVisitor = async (req, res) => {
  try {
    const { name, visitingTime, residentId } = req.body;
    const newVisitor = new Visitor({ name, visitingTime, residentId });
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (error) {
    console.error('Error creating visitor:', error);
    res.status(500).json({ error: 'Error creating visitor' });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.json("authenticated");
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
    res.json(visitor);
  } catch (error) {
    console.error('Error getting visitor:', error);
    res.status(500).json({ error: 'Error getting visitor' });
  }
};

exports.updateVisitor = async (req, res) => {
  try {
    const { name, visitingTime, residentId } = req.body;
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { name, visitingTime, residentId },
      { new: true }
    );
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json(visitor);
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