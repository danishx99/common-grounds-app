const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
