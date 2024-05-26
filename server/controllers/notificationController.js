const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios"); // simplifies sending asynchronous HTTP requests to REST endpoints

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
    notifications.forEach((notification) => {
      if (!notification.viewedBy.includes(userCode)) {
        notification.viewedBy.push(userCode);
        notification.save();
      }
    });

    // for (var i = 0; i < notifications.length; i++) {
    //   //Get the user name and surname that issued the notification
    //   let userCode = notifications[i].issuedBy;
    //   let user = await User.findOne({ userCode: userCode });
    //   if (!user) {
    //     user = { name: "Unknown", surname: "Unknown" };
    //   }
    //   // console.log("user", user);
    //   console.log(user.name + " " + user.surname);

    //   notifications[i].issuedBy = user.name + " " + user.surname;
    // }

    res.status(200).json({ notifications: notifications });
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
    const notifications = await Notification.find({
      viewedBy: { $ne: userCode },
    });

    // check that each notification was made after the user was created
    const user = await User.findOne({ userCode: userCode });
    const userCreatedDate = user.createdAt;
    const unreadNotifications = notifications.filter(
      (notification) => notification.createdAt > userCreatedDate
    );

    res.status(200).json({ unreadNotifications: unreadNotifications.length });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Error fetching unread notifications" });
  }
};

exports.getExtremeWeatherNotifications = async (req, res) => {
  console.log("Getting weather data...");

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    // Example location; replace with desired location
    const locationName = "Johannesburg";

    // Construct the request URL
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationName}&alerts=yes`;

    // Make the GET request to the WeatherAPI
    const response = await axios.get(url);

    // how do we determine if the weather is extreme?
    // const currCondition = response.data.current.condition.text;
    // const currTemp = response.data.current.temp_c;
    const alerts = response.data.current.alerts;
    const event = "";

    let extremeWeather = false;
    //|| currCondition.includes("rain") || currCondition.includes("storm") || currCondition.includes("hail") || currTemp > 30  || currTemp < 0

    if (alerts != null) {
      event = alerts.alert[0].event;
      console.log("Extreme weather alert!");
      extremeWeather = true;
    } else {
      console.log("No extreme weather alert");
    }
    res.status(200).json({ extremeWeather: extremeWeather, event: event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve weather data" });
  }
};
