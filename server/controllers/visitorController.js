const Visitor = require('../models/Visitor');
const User = require('../models/User');



exports.checkInVisitor = async (req, res) => {
  try {
    const { fname, lname, cellnum, id, password } = req.body;

    const UserBeingVisited = await User.findOne({ visitorPassword: password });

   
    //Check ID number is of length 13(Visitor needs to bring ID book so that the ID number can be verified)
    if(id.length !== 13){
      return res.status(404).json({ error: 'ID number must be 13 digits long.' });
    }
    
    //Check cellphone number is 10 digits long and starts with 0
    if(cellnum.length !== 10 || cellnum.charAt(0) !== '0'){
      return res.status(404).json({ error: 'Cellphone number must be 10 digits long and start with a 0.' });
    }

    if(!UserBeingVisited){
      return res.status(404).json({ error: 'Invalid visitor password.' });
    }
    
     //check if the current date is 24 hours more than the one stored in the database
    if(UserBeingVisited.visitorPasswordCreatedAt + 24 * 60 * 60 * 1000 < Date.now()){
      return res.status(404).json({ error: 'Visitor password expired.' });

    }

    //check if visitor is already checked in
    const visitorAlreadyCheckedIn = await Visitor.findOne({  identificationNumber: id });

    if(visitorAlreadyCheckedIn){
      return res.status(404).json({ error: 'Visitor already checked in.' });
    }



    //create new visitor using above format

    const newVisitor = new Visitor({ name: fname + " " + lname,
     checkInTime: Date.now(),
      identificationNumber: id,
      cellPhoneNumber: cellnum,
      userCode: UserBeingVisited.userCode });
      
    await newVisitor.save();

    res.json({ message: 'Visitor checked in successfully' });
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
