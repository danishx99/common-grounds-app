const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
  try {
    const { title, content, issuedBy, issuedTo, expiresAt } = req.body;
    const newNotice = new Notice({ title, content, issuedBy, issuedTo, expiresAt });
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Error creating notice' });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.json(notices);
  } catch (error) {
    console.error('Error getting notices:', error);
    res.status(500).json({ error: 'Error getting notices' });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json(notice);
  } catch (error) {
    console.error('Error getting notice:', error);
    res.status(500).json({ error: 'Error getting notice' });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { title, content, issuedTo, expiresAt } = req.body;
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content, issuedTo, expiresAt },
      { new: true }
    );
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json(notice);
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ error: 'Error updating notice' });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Error deleting notice' });
  }
};