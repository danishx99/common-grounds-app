const bcrypt = require('bcryptjs');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

async function hashPassword(password) {
  // Check if password meets complexity requirements
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

module.exports = { hashPassword };