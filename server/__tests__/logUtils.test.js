const User = require('../models/User');
const logUtils = require('../utils/logUtils');

jest.mock('../models/User');
beforeEach(() => {
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
  
afterEach(() => {
    // Restore the original console.error function
    console.error.mockRestore();
});
describe('detectSuspiciousLogins', () => {
  it('should detect suspicious logins', async () => {
    const users = [
      {
        name: 'John',
        surname: 'Doe',
        loginHistory: [
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'failed' },
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'failed' },
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'failed' },
        ],
      },
      {
        name: 'Jane',
        surname: 'Smith',
        loginHistory: [
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'failed' },
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'failed' },
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'success' },
        ],
      },
    ];

    User.find.mockResolvedValue(users);
    console.log = jest.fn();
    try {
      await logUtils.detectSuspiciousLogins();
    } catch (error) {
        expect(User.find).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Suspicious login activity detected for user John Doe');
        expect(console.log).not.toHaveBeenCalledWith('Suspicious login activity detected for user Jane Smith');
    }
  });

  it('should handle error while detecting suspicious logins', async () => {
    const error = new Error('Database connection error');
    User.find.mockRejectedValue(error);
    console.error = jest.fn();

    await logUtils.detectSuspiciousLogins();

    expect(User.find).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error detecting suspicious logins:', error);
  });
});
