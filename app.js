const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const dotenv = require("./server/node_modules/dotenv");
const authRoutes = require("./server/routes/authRoutes");
const userRoutes = require("./server/routes/userRoutes");
const visitorRoutes = require("./server/routes/visitorRoutes");
const issueRoutes = require("./server/routes/issueRoutes");
const reportRoutes = require("./server/routes/reportRoutes");
const fineRoutes = require("./server/routes/fineRoutes");
const frontendRoutes = require("./server/routes/frontendRoutes");
const notificationRoutes = require("./server/routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

// Middleware
// Increase the payload size limit

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//Cookie parser
app.use(cookieParser());

//Serve frontend from two folders above the current directory
app.use(express.static("client"));
app.use("/admin", express.static("client"));
app.use("/staff", express.static("client"));
app.use("/resident", express.static("client"));
app.use("/admin", express.static("client"));

const path = require("path");

//Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/clear", (req, res) => {
  res.clearCookie("token");
  res.send("Cookie cleared");
});
app.use("", frontendRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res, next) => {
  // Send the HTML file for unknown routes
  res.sendFile(path.join(__dirname, "./client/404notFound.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
