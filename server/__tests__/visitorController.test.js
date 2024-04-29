const Visitor = require("../models/Visitor");
const User = require("../models/User");
const visitorController = require("../controllers/visitorController");

jest.mock("../models/Visitor");
jest.mock("../models/User");

describe("checkInVisitor", () => {
  it("should return 404 if cellphone number is not 10 digits long or does not start with 0", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "123456789",
        id: "1234567890123",
        password: "password",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Cellphone number must be 10 digits long and start with a 0.",
    });
  });

  it("should return 404 if visitor password is invalid", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "0123456789",
        id: "1234567890123",
        password: "invalidPassword",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne.mockResolvedValueOnce(null);
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid visitor password.",
    });
  });

  it("should return 404 if visitor password has expired", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "0123456789",
        id: "1234567890123",
        password: "validPassword",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = {
      visitorPassword: "validPassword",
      visitorPasswordCreatedAt: Date.now() - 25 * 60 * 60 * 1000,
    }; // 25 hours ago
    User.findOne.mockResolvedValueOnce(user);
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Visitor password expired.",
    });
  });

  it("should return 404 if visitor is already checked in", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "0123456789",
        id: "1234567890123",
        password: "validPassword",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = {
      visitorPassword: "validPassword",
      visitorPasswordCreatedAt: Date.now(),
    };
    User.findOne.mockResolvedValueOnce(user);
    Visitor.findOne.mockResolvedValueOnce({
      identificationNumber: "1234567890123",
    });
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Visitor already checked in.",
    });
  });

  it("should check in a visitor successfully", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "0123456789",
        id: "1234567890123",
        password: "validPassword",
      },
    };
    const res = { json: jest.fn() };
    const user = {
      visitorPassword: "validPassword",
      visitorPasswordCreatedAt: Date.now(),
      userCode: "userCode",
    };
    User.findOne.mockResolvedValueOnce(user);
    Visitor.findOne.mockResolvedValueOnce(null);
    const mockSave = jest.fn();
    Visitor.mockImplementationOnce(() => ({ save: mockSave }));
    await visitorController.checkInVisitor(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Visitor checked in successfully",
    });
  });
});

// it("should get all visitors", async () => {
//   const res = { json: jest.fn() };

//   // Dynamically generate some mock data
//   const mockVisitors = [
//     { name: "Visitor 1", checkOutTime: new Date("2023-05-30T10:00:00") },
//     { name: "Visitor 2", checkOutTime: new Date("2023-05-29T20:00:00") },
//     // ... Add more, ensuring checkOutTime is in ascending order
//   ];

//   Visitor.find.mockResolvedValueOnce(mockVisitors);

//   await visitorController.getAllVisitors(null, res);

//   expect(Visitor.find).toHaveBeenCalled();
//   expect(res.json).toHaveBeenCalledWith({
//     message: "Successfully got visitors",
//     visitors: mockVisitors, // Expect the mocked data
//   });
// });

// describe("checkOutVisitor", () => {
//   it("should return 404 if visitor is not found", async () => {
//     const req = { params: { id: "visitorId" } };
//     const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//     Visitor.findById.mockResolvedValueOnce(null);
//     await visitorController.checkOutVisitor(req, res);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ error: "Visitor not found" });
//   });

//   it("should check out a visitor", async () => {
//     const req = { params: { id: "visitorId" } };
//     const res = { json: jest.fn() };
//     const visitor = { name: "John Doe" };
//     Visitor.findById.mockResolvedValueOnce(visitor);
//     const mockSave = jest.fn();
//     visitor.save = mockSave;
//     await visitorController.checkOutVisitor(req, res);
//     expect(mockSave).toHaveBeenCalled();
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Visitor checked out successfully",
//       visitor,
//     });
//   });
// });
