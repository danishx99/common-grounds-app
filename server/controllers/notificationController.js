const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.sendNotification = async (req, res) => {
  try {
    const token = req.cookies.token;
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const issuedBy = verified.userCode;

    const { title, description } = req.body;

    const newNotification = new Notification({
      title,
      description,
      
      issuedBy,
    });

    await newNotification.save();
    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    


    const notifications = await Notification.find();

    //Get current user
    const token = req.cookies.token;
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const userCode = verified.userCode;

    //add userCode to viewedBy array in notifications
    notifications.forEach(async (notification) => {
      if (!notification.viewedBy.includes(userCode)) {
        notification.viewedBy.push(userCode);
        await notification.save();
      }
    });

   
    

    

    for (var i = 0; i < notifications.length; i++) {
      //Get the user name and surname that issued the notification
      let userCode = notifications[i].issuedBy; 
      let user = await User.findOne({userCode: userCode});
      if(!user) {
        user = {name: "Unknown", surname: "Unknown"};
      }
      // console.log("user", user);
      console.log(user.name + " " + user.surname)

      notifications[i].issuedBy = user.name + " " + user.surname;

    }
    





    


    res.status(200).json({notifications: notifications});
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

// Get unread notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const token = req.cookies.token;
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const userCode = verified.userCode;

    //Check the notifications that dont have the userCode in the viewedBy array
    const notifications = await Notification.find({ viewedBy: { $ne: userCode } });
    
    
    res.status(200).json({unreadNotifications: notifications.length});
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Error fetching unread notifications" });
  }
};

exports.getExtremeWeatherNotifications = async (req, res) => {

}




