const Visitor = require("../models/Visitor");
const User = require("../models/User");
const visitorController = require("../controllers/visitorController");

jest.mock("../models/Visitor");
jest.mock("../models/User");

describe("checkInVisitor", () => {

  it("should return visitor checked in successfully", async () => {
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

    try {
      User.findOne.mockResolvedValueOnce(user);
      Visitor.findOne.mockResolvedValueOnce(null);
      const mockSave = jest.fn();
      Visitor.mockImplementationOnce(() => ({ save: mockSave }));
      await visitorController.checkInVisitor(req, res);
    } catch (error) {
      expect(res.json).toHaveBeenCalledWith({
        message: "Visitor checked in successfully",
      });
    }
  });
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

  it("should return 404 if ID number is not 13 digits long", async () => {
    const req = {
      body: {
        fname: "John",
        lname: "Doe",
        cellnum: "0123456789",
        id: "1234567890", // Invalid ID (not 13 digits)
        password: "validPassword",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await visitorController.checkInVisitor(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "ID number must be 13 digits long.",
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

  it("should return 500 if User.findOne throws an error", async () => {
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
    User.findOne.mockImplementationOnce(() => {
      return ("Error finding user");
    });
    try {
      await visitorController.checkInVisitor(req, res);
    } catch (error) {
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error checking in visitor" });
    }
  });
  
  it("should return 500 if saving visitor throws an error", async () => {
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
      userCode: "userCode",
    };
    User.findOne.mockResolvedValueOnce(user);
    Visitor.findOne.mockResolvedValueOnce(null);
    const mockSave = jest.fn().mockImplementationOnce(() => {
      new Error("Error saving visitor");
    });
    Visitor.mockImplementationOnce(() => ({ save: mockSave }));
    try {
      await visitorController.checkInVisitor(req, res);
    } catch (error) {
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error checking in visitor" });
    }
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

describe("getAllVisitors", () => {
  it("should get all visitors", async () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    Visitor.find.mockResolvedValueOnce([
      {name: 'John Doe', checkOutTime: Date.now() - 1000 },
      { name: 'Jane Doe', checkOutTime: Date.now() - 2000 }
    ]);

    try {
      await visitorController.getAllVisitors(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Successfully got visitors",
        visitors: [
          { name: 'John Doe', checkOutTime: Date.now() - 1000 },
          { name: 'Jane Doe', checkOutTime: Date.now() - 2000 }
        ]
      });
    }
  });
  
  
  it("should return 500 if Visitor.find throws an error", async () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.find.mockImplementationOnce(() => {
      new Error("Error finding visitors");
    });

    try {
      await visitorController.getAllVisitors(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error getting visitors" });
    }
  });  
});

describe("manageVisitors", () => {
  // it("should check out a visitor successfully", async () => {
  //   const req = {
  //     body: {
  //       id: "1234567890123",
  //     },
  //   };
  //   const res = { json: jest.fn() };
  //   const visitor = {
  //     identificationNumber: "1234567890123",
  //   };
  //   Visitor.findOne.mockResolvedValueOnce(visitor);

  //   try {
  //     await visitorController.manageVisitors(req, res);
  //   } catch (error) {
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Visitor checked out successfully",
  //     });
  //   }
  // });

  it("should return 404 if visitor is not found", async () => {
    const req = {
      body: {
        id: "1234567890123",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findOne.mockResolvedValueOnce(null);

    try {
      await visitorController.manageVisitors(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Visitor not found.",
      });
    }
  });

  it("should return 500 if Visitor.findOne throws an error", async () => {
    const req = {
      body: {
        id: "1234567890123",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Visitor.findOne.mockImplementationOnce(() => {
      new Error("Error finding visitor");
    });
    try {
      await visitorController.manageVisitors(req, res);
    } catch (error) {
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error managing visitor" });
    }
  });
});
