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
  identificationNumber: {
    type: String,
    required: true,
  },
  cellPhoneNumber: {
    type: String,
    required: true,
  },

  checkOutTime: {
    type: Date,
    required: false,
  },
  userCode: {
    type: String,
    required: true
  }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
