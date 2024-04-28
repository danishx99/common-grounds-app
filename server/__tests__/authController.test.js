const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Code = require('../models/Code');
const transporter = require('../utils/mailer');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('../models/Code');
jest.mock('../utils/mailer');

describe('registerUser', () => {
  it('should return 400 if email is invalid', async () => {
    const req = { body: { email: 'invalid-email' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide a valid email' });
  });

  it('should return 400 if user already exists', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce({ email: 'test@example.com' });
    await authController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address already exists.' });
  });

  it('should return 400 if passwords do not match', async () => {
    const req = { body: { password: 'password', confirmPassword: 'incorrect' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
  });

  it('should register a new user if all validations pass', async () => {
    const req = { body: { name: 'John Doe', surname: 'Doe', password: 'validPassword', confirmPassword: 'validPassword', email: 'test@example.com', role: 'user', code: 'validCode', faceId: 'faceId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    Code.findOne.mockResolvedValueOnce({ role: 'user' });
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    const mockSave = jest.fn();
    User.mockImplementationOnce(() => ({ save: mockSave }));
    Code.deleteOne.mockResolvedValueOnce();
    await authController.registerUser(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
  });
});

describe('loginUser', () => {
  it('should return 401 if user not found', async () => {
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    await authController.loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return 401 if password is incorrect', async () => {
    const req = { body: { email: 'test@example.com', password: 'incorrect' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { password: 'hashedPassword' };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);
    await authController.loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should set a token cookie and return success if credentials are valid', async () => {
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
    const user = { password: 'hashedPassword', userCode: 'userCode', role: 'role' };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('token');
    await authController.loginUser(req, res);
    expect(jwt.sign).toHaveBeenCalledWith({ userCode: 'userCode', role: 'role' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    expect(res.cookie).toHaveBeenCalledWith('token', 'token', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    expect(res.json).toHaveBeenCalledWith({ success: true, redirect: 'role' });
  });
});

describe('forgetPassword', () => {
  it('should return 400 if email is invalid', async () => {
    const req = { body: { email: 'invalid-email' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authController.forgetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide a valid email' });
  });

  it('should return 404 if user not found', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    await authController.forgetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should send a password reset email if user is found', async () => {
    const req = { body: { email: 'test@example.com' }, protocol: 'http', get: jest.fn().mockReturnValue('localhost:3000') };
    const res = { json: jest.fn() };
    const user = { _id: 'userId', email: 'test@example.com', name: 'John Doe' };
    User.findOne.mockResolvedValueOnce(user);
    jwt.sign.mockReturnValueOnce('resetToken');
    transporter.sendMail.mockResolvedValueOnce({ messageId: 'messageId' });
    await authController.forgetPassword(req, res);
    expect(jwt.sign).toHaveBeenCalledWith({ userId: 'userId', email: 'test@example.com' }, process.env.RESET_JWT_SECRET, { expiresIn: '1h' });
    expect(transporter.sendMail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled({ message: 'Password reset instructions have been sent to your email' });
  });
});

describe('resetPassword', () => {
  it('should return 400 if passwords do not match', async () => {
    const req = { body: { resetToken: 'token', password: 'password', confirmPassword: 'incorrect' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
  });

  it('should return 400 if password complexity is invalid', async () => {
    const req = { body: { resetToken: 'token', password: 'weak', confirmPassword: 'weak' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const valPassComplexity = require('../utils/passwordUtils');
    valPassComplexity.checkPassword.mockResolvedValueOnce(false);
    await authController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character' });
  });
  
  it('should reset the password and send a confirmation email', async () => {
    const req = { body: { resetToken: 'validToken', password: 'validPassword', confirmPassword: 'validPassword' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { email: 'test@example.com', name: 'John Doe' };
    jwt.verify.mockReturnValueOnce({ email: 'test@example.com' });
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    const mockSave = jest.fn();
    User.mockImplementationOnce(() => ({ save: mockSave }));
    transporter.sendMail.mockResolvedValueOnce({ messageId: 'messageId' });
    await authController.resetPassword(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(transporter.sendMail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
  });
});

describe('generateCode', () => {
  it('should generate and save a new code', async () => {
    const req = { body: { role: 'admin' } };
    const res = { json: jest.fn() };
    const mockSave = jest.fn();
    Code.mockImplementationOnce(() => ({ save: mockSave }));
    await authController.generateCode(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
  });
});
describe('registerFace', () => {
  it('should return 500 if an error occurs during face registration', async () => {
    const req = { body: { image: 'imageData' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const msDetectData = { error: 'Error registering face' };
    https.request.mockImplementationOnce(() => ({
    on: jest.fn().mockImplementation((event, callback) => {
    if (event === 'error') {
      callback(new Error('Error during face registration'));
    }
    }),
    write: jest.fn(),
    end: jest.fn(),
    }));
    await authController.registerFace(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error during face registration');
  });

  it('should return 500 if an error is returned from the Face API', async () => {
    const req = { body: { image: 'imageData' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const msDetectData = { error: 'Error registering face' };
    https.request.mockImplementationOnce(() => ({
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'end') {
          callback();
        }
      }),
      write: jest.fn(),
      end: jest.fn(),
    }));
    await authController.registerFace(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(msDetectData.error);
  });
  
  it('should register the face and update the user faceId', async () => {
    const req = { body: { image: 'imageData' }, user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const msDetectData = { faceId: 'faceId' };
    const mockSave = jest.fn();
    User.findById.mockResolvedValueOnce({ save: mockSave });
    https.request.mockImplementationOnce(() => ({
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'end') {
          callback(JSON.stringify(msDetectData));
        }
      }),
      write: jest.fn(),
      end: jest.fn(),
    }));
    await authController.registerFace(req, res);
    expect(User.findById).toHaveBeenCalledWith('userId');
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ message: 'Face registered successfully', faceId: 'faceId' });
  });
});

describe('verifyFace', () => {
  it('should return 400 if neither faceId nor image is provided', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authController.verifyFace(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Either faceId or image is required' });
  });

  it('should return 403 if user is not found', async () => {
    const req = { body: { name: 'John', surname: 'Doe' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    await authController.verifyFace(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
  
  it('should return 403 if face verification fails', async () => {
    const req = { body: { name: 'John', surname: 'Doe', faceId: 'faceId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { faceId: 'userFaceId' };
    User.findOne.mockResolvedValueOnce(user);
    const faceApi = require('../utils/faceApi');
    faceApi.verify.mockResolvedValueOnce({ isIdentical: false, confidence: 0.5 });
    await authController.verifyFace(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Face verification failed.' });
  });

  it('should return success if face verification passes', async () => {
    const req = { body: { name: 'John', surname: 'Doe', faceId: 'faceId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { faceId: 'userFaceId' };
    User.findOne.mockResolvedValueOnce(user);
    const faceApi = require('../utils/faceApi');
    faceApi.verify.mockResolvedValueOnce({ isIdentical: true, confidence: 0.9 });
    await authController.verifyFace(req, res);
    // Add assertions for successful verification
  });
});

describe('generateVisitorPassword', () => {
  it('should return 400 if the visitor password has been generated recently', async () => {
    const req = { cookies: { token: 'validToken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { visitorPassword: 'password', visitorPasswordCreatedAt: Date.now() - 3600000 };
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode' });
    User.findOne.mockResolvedValueOnce(user);
    await authController.generateVisitorPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String), password: 'password' });
  });
  
  it('should generate a new visitor password and update the user', async () => {
    const req = { cookies: { token: 'validToken' } };
    const res = { json: jest.fn() };
    const user = { visitorPassword: null, visitorPasswordCreatedAt: null };
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode' });
    User.findOne.mockResolvedValueOnce(user);
    const mockSave = jest.fn();
    User.mockImplementationOnce(() => ({ save: mockSave }));
    await authController.generateVisitorPassword(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ password: expect.any(Number) });
  });
});
