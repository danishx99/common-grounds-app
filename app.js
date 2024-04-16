const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const issueRoutes = require('./routes/issueRoutes');
const fineRoutes = require('./routes/fineRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const frontendRoutes = require('./routes/frontendRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

// Middleware
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Serve frontend from two folders above the current directory
app.use(express.static('client'));

//Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('', frontendRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/notices', noticeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = app;



