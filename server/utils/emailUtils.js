const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Check if email meets requirements to be an email
async function validateEmail(email) {
    if (!EMAIL_REGEX.test(email)) {
        return false;
    }
    return true;
    }


// module export as a function
module.exports = validateEmail;