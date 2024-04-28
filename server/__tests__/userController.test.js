const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');
const userController = require('../controllers/userController');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('../utils/passwordUtils');

describe('changePassword', () => {
  it('should return 404 if user is not found', async () => {
    const req = { body: { currentPassword: 'currentPassword', newPassword: 'newPassword' }, userId: 'userId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findById.mockResolvedValueOnce(null);
    await userController.changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 401 if current password is incorrect', async () => {
    const req = { body: { currentPassword: 'incorrectPassword', newPassword: 'newPassword' }, userId: 'userId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { password: 'hashedPassword' };
    User.findById.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);
    await userController.changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid current password' });
  });

  it('should change the password if current password is valid', async () => {
    const req = { body: { currentPassword: 'currentPassword', newPassword: 'newPassword' }, userId: 'userId' };
    const res = { json: jest.fn() };
    const user = { password: 'hashedPassword', save: jest.fn() };
    User.findById.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);
    hashPassword.mockResolvedValueOnce('hashedNewPassword');
    await userController.changePassword(req, res);
    expect(user.password).toBe('hashedNewPassword');
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
  });
});

describe('removeAccess', () => {
  it('should remove user access', async () => {
    const req = { params: { userId: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findByIdAndDelete.mockResolvedValueOnce();
    await userController.removeAccess(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('userId');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User access revoked' });
  });

  it('should return 404 if user not found', async () => {
    const req = { params: { userId: 'nonexistentUserId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findByIdAndDelete.mockResolvedValueOnce(null);
    await userController.removeAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});

describe('changePermissions', () => {
  it('should change user permissions', async () => {
    const req = { params: { userId: 'userId' }, body: { role: 'newRole' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const updatedUser = { role: 'newRole' };
    User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);
    await userController.changePermissions(req, res);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', { role: 'newRole' }, { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User permissions updated', user: updatedUser });
  });

  it('should return 404 if user not found', async () => {
    const req = { params: { userId: 'nonexistentUserId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findByIdAndUpdate.mockResolvedValueOnce(null);
    await userController.changePermissions(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});

describe('getUsers', () => {
  it('should get users without filters', async () => {
    const req = { query: {} };
    const res = { json: jest.fn() };
    const users = [{ name: 'John' }, { name: 'Jane' }];
    User.find.mockResolvedValueOnce(users);
    await userController.getUsers(req, res);
    expect(User.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('should get users with filters', async () => {
    const req = { query: { name: 'John', email: 'john@example.com', role: 'admin' } };
    const res = { json: jest.fn() };
    const users = [{ name: 'John Doe', email: 'john@example.com', role: 'admin' }];
    User.find.mockResolvedValueOnce(users);
    await userController.getUsers(req, res);
    expect(User.find).toHaveBeenCalledWith({ name: { $regex: 'John', $options: 'i' }, email: 'john@example.com', role: 'admin' });
    expect(res.json).toHaveBeenCalledWith(users);
  });
});

describe('getUserDetails', () => {
  it('should return 404 if user is not found', async () => {
    const req = { cookies: { token: 'validToken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode' });
    User.find.mockResolvedValueOnce([]);
    await userController.getUserDetails(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return user details', async () => {
    const req = { cookies: { token: 'validToken' } };
    const res = { json: jest.fn() };
    const user = { userCode: 'userCode', name: 'John' };
    jwt.verify.mockReturnValueOnce({ userCode: 'userCode' });
    User.find.mockResolvedValueOnce([user]);
    await userController.getUserDetails(req, res);
    expect(User.find).toHaveBeenCalledWith({ userCode: 'userCode' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Successfully got user details', user: [{ userCode: 'userCode', name: 'John' }] });
  });
});
