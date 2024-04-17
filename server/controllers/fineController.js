const Fine = require('../models/Fine');

exports.issueFine = async (req, res) => {
  try {
    const { amount, reason, issuedTo, issuedBy } = req.body;
    const newFine = new Fine({ amount, reason, issuedTo, issuedBy });
    await newFine.save();
    res.status(201).json(newFine);
  } catch (error) {
    console.error('Error issuing fine:', error);
    res.status(500).json({ error: 'Error issuing fine' });
  }
};

exports.getFines = async (req, res) => {
  try {
    const fines = await Fine.find();
    res.json(fines);
  } catch (error) {
    console.error('Error getting fines:', error);
    res.status(500).json({ error: 'Error getting fines' });
  }
};

exports.getFineById = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }
    res.json(fine);
  } catch (error) {
    console.error('Error getting fine:', error);
    res.status(500).json({ error: 'Error getting fine' });
  }
};

exports.payFine = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndUpdate(
      req.params.id,
      { isPaid: true },
      { new: true }
    );
    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }
    res.json(fine);
  } catch (error) {
    console.error('Error paying fine:', error);
    res.status(500).json({ error: 'Error paying fine' });
  }
};