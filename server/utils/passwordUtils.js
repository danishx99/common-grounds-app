const bcrypt = require('bcryptjs');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

async function checkPassword(password) {
  // Check if password meets complexity requirements
  if (!PASSWORD_REGEX.test(password)) {
    return false;
  }

  return true;

}

module.exports = { checkPassword };