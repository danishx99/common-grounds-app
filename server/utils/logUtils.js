const User = require('../models/User');

async function detectSuspiciousLogins() {
    try {
      const users = await User.find();
      for (const user of users) {
        const recentLogins = user.loginHistory.filter(login => login.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)); // Last 24 hours
        const failedLogins = recentLogins.filter(login => login.status === 'failed');
        if (failedLogins.length >= 3) {
          // Flag the user as potentially suspicious and take appropriate action
          console.log(`Suspicious login activity detected for user ${user.name} ${user.surname}`);
        }
      }
    } catch (error) {
      console.error('Error detecting suspicious logins:', error);
    }
  }
  
  module.exports = { detectSuspiciousLogins };