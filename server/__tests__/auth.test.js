const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const middleware = require('../middleware/auth');

jest.mock('jsonwebtoken');
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

beforeEach(() => {
  process.env.JWT_SECRET = 'secretKey';
  process.env.RESET_JWT_SECRET = 'resetSecretKey';
});

afterEach(() => {
  jest.resetModules();
});

describe('verifyToken', () => {
  it('should return 401 if no token is provided', () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    middleware.verifyToken(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to access this resource(Not logged in)' });
  });

  it('should return 401 if an invalid token is provided', () => {
    const req = { cookies: { token: 'invalidToken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    middleware.verifyToken(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should set the userCode and role on the request object and call the next middleware', () => {
    const req = { cookies: { token: 'validToken' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode', role: 'role' });
    middleware.verifyToken(req, res, next);
    expect(req.userCode).toBe('userCode');
    expect(req.role).toBe('role');
    expect(next).toHaveBeenCalled();
  });
});

describe('verifyResetToken', () => {
  it('should return 401 if an invalid reset token is provided', () => {
    const req = { params: { token: 'invalidResetToken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid reset token');
    });
    middleware.verifyResetToken(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid reset token' });
  });

  it('should set the userCode and role on the request object and call the next middleware', () => {
    const req = { params: { token: 'validResetToken' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode', role: 'role' });
    middleware.verifyResetToken(req, res, next);
    expect(req.userCode).toBe('userCode');
    expect(req.role).toBe('role');
    expect(next).toHaveBeenCalled();
  });
});
