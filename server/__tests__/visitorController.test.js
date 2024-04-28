const Visitor = require('../models/Visitor');
const User = require('../models/User');
const visitorController = require('../controllers/visitorController');

jest.mock('../models/Visitor');
jest.mock('../models/User');

describe('checkInVisitor', () => {
  it('should return 404 if ID number is not 13 digits long', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '0123456789', id: '1234567890123', password: 'password' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID number must be 13 digits long.' });
  });

  it('should return 404 if cellphone number is not 10 digits long or does not start with 0', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '123456789', id: '1234567890123', password: 'password' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cellphone number must be 10 digits long and start with a 0.' });
  });

  it('should return 404 if visitor password is invalid', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '0123456789', id: '1234567890123', password: 'invalidPassword' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid visitor password.' });
  });

  it('should return 404 if visitor password has expired', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '0123456789', id: '1234567890123', password: 'validPassword' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { visitorPassword: 'validPassword', visitorPasswordCreatedAt: Date.now() - (25 * 60 * 60 * 1000) }; // 25 hours ago
    User.findOne.mockResolvedValueOnce(user);
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor password expired.' });
  });

  it('should return 404 if visitor is already checked in', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '0123456789', id: '1234567890123', password: 'validPassword' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { visitorPassword: 'validPassword', visitorPasswordCreatedAt: Date.now() };
    User.findOne.mockResolvedValueOnce(user);
    Visitor.findOne.mockResolvedValueOnce({ identificationNumber: '1234567890123' });
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor already checked in.' });
  });

  it('should check in a visitor successfully', async () => {
    const req = { body: { fname: 'John', lname: 'Doe', cellnum: '0123456789', id: '1234567890123', password: 'validPassword' } };
    const res = { json: jest.fn() };
    const user = { visitorPassword: 'validPassword', visitorPasswordCreatedAt: Date.now(), userCode: 'userCode' };
    User.findOne.mockResolvedValueOnce(user);
    Visitor.findOne.mockResolvedValueOnce(null);
    const mockSave = jest.fn();
    Visitor.mockImplementationOnce(() => ({ save: mockSave }));
    await visitorController.checkInVisitor(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Visitor checked in successfully' });
  });
});

describe('getVisitors', () => {
  it('should get all visitors', async () => {
    const res = { json: jest.fn() };
    const visitors = [{ name: 'John Doe' }, { name: 'Jane Doe' }];
    Visitor.find.mockResolvedValueOnce(visitors);
    await visitorController.getVisitors(null, res);
    expect(Visitor.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Successfully got visitors', visitors });
  });
});

describe('getVisitorById', () => {
  it('should return 404 if visitor is not found', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findById.mockResolvedValueOnce(null);
    await visitorController.getVisitorById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor not found' });
  });

  it('should get a visitor by ID', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { json: jest.fn() };
    const visitor = { name: 'John Doe' };
    Visitor.findById.mockResolvedValueOnce(visitor);
    await visitorController.getVisitorById(req, res);
    expect(Visitor.findById).toHaveBeenCalledWith('visitorId');
    expect(res.json).toHaveBeenCalledWith({ message: 'Successfully got visitor', visitor });
  });
});

describe('updateVisitor', () => {
  it('should return 404 if visitor is not found', async () => {
    const req = { params: { id: 'visitorId' }, body: { name: 'John Doe' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findByIdAndUpdate.mockResolvedValueOnce(null);
    await visitorController.updateVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor not found' });
  });

  it('should update a visitor', async () => {
    const req = { params: { id: 'visitorId' }, body: { name: 'John Doe', checkInTime: Date.now(), hostId: 'hostId', checkOutTime: Date.now() } };
    const res = { json: jest.fn() };
    const visitor = { name: 'John Doe', checkInTime: Date.now(), hostId: 'hostId', checkOutTime: Date.now() };
    Visitor.findByIdAndUpdate.mockResolvedValueOnce(visitor);
    await visitorController.updateVisitor(req, res);
    expect(Visitor.findByIdAndUpdate).toHaveBeenCalledWith('visitorId', { name: 'John Doe', checkInTime: Date.now(), hostId: 'hostId', checkOutTime: Date.now() }, { new: true });
    expect(res.json).toHaveBeenCalledWith({ message: 'Successfully updated visitor', visitor });
  });
});
describe('deleteVisitor', () => {
  it('should return 404 if visitor is not found', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findByIdAndDelete.mockResolvedValueOnce(null);
    await visitorController.deleteVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor not found' });
  });

  it('should delete a visitor', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { json: jest.fn() };
    const visitor = { name: 'John Doe' };
    Visitor.findByIdAndDelete.mockResolvedValueOnce(visitor);
    await visitorController.deleteVisitor(req, res);
    expect(Visitor.findByIdAndDelete).toHaveBeenCalledWith('visitorId');
    expect(res.json).toHaveBeenCalledWith({ message: 'Visitor deleted successfully' });
  });
});

describe('checkOutVisitor', () => {
  it('should return 404 if visitor is not found', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findById.mockResolvedValueOnce(null);
    await visitorController.checkOutVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visitor not found' });
  });

  it('should check out a visitor', async () => {
    const req = { params: { id: 'visitorId' } };
    const res = { json: jest.fn() };
    const visitor = { name: 'John Doe' };
    Visitor.findById.mockResolvedValueOnce(visitor);
    const mockSave = jest.fn();
    visitor.save = mockSave;
    await visitorController.checkOutVisitor(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Visitor checked out successfully', visitor });
  });
});
