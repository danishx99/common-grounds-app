const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const dotenv = require("./server/node_modules/dotenv");
const authRoutes = require("./server/routes/authRoutes");
const userRoutes = require("./server/routes/userRoutes");
const visitorRoutes = require("./server/routes/visitorRoutes");
const issueRoutes = require("./server/routes/issueRoutes");
const fineRoutes = require("./server/routes/fineRoutes");
const noticeRoutes = require("./server/routes/noticeRoutes");
const frontendRoutes = require("./server/routes/frontendRoutes");


const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();


// Middleware
// Increase the payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

//Cookie parser
app.use(cookieParser());

//Serve frontend from two folders above the current directory
app.use(express.static("client"));

const path = require("path");

app.use('/admin', express.static("client"));


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
app.use("/api/issues", issueRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/notices", noticeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
