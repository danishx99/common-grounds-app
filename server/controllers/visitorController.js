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

   let name = fname + " " + lname;
   

    //create new visitor using above format

    const newVisitor = new Visitor({name,
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




exports.getAllVisitors = async (req, res) => {
  try {

    // await Visitor.deleteMany({})


    // Get all visitors and sort by check out time
    const visitors = await Visitor.find().sort({ checkOutTime: 'asc' });

    

    res.status(200).json({ message: 'Successfully got visitors', visitors : visitors });

  } catch (error) {
    console.error('Error getting visitors:', error);
    res.status(500).json({ error: 'Error getting visitors' });
  }
};




// Check out visitors
exports.manageVisitors = async (req, res) => {
  try {

    const { id } = req.body;

    const visitor = await Visitor.findOne({ identificationNumber: id });

    visitor.checkOutTime = Date.now();

    await visitor.save();

    res.status(200).json({ message: 'Visitor checked out successfully', visitor: visitor});


  } catch (error) {
    console.log("Error checking out visitor:", error);
    res.status(500).json({ error: "Error checking out visitor" });
  }
};