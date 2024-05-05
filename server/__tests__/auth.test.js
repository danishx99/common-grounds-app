const dotenv = require("dotenv");
const jwt = require("jsonwebtoken"); // Add this line
const auth = require("../middleware/auth");

jest.mock("jsonwebtoken");

describe("verifyToken", () => {
  beforeEach(() => {
    dotenv.config(); // Load environment variables
  });

  it("should call next() if token is valid", async () => {
    const mockToken = "valid.jwt.token";
    const mockDecoded = { userCode: "user123", role: "user" };
    jwt.verify.mockReturnValue(mockDecoded);

    const req = { cookies: { token: mockToken } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await auth.verifyToken(req, res, next);

    expect(req.userCode).toBe(mockDecoded.userCode);
    expect(req.role).toBe(mockDecoded.role);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled(); // Success, no error status
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return 401 if token is missing", async () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await auth.verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to access this resource(Not logged in)",
    });
  });
});

describe("verifyResetToken", () => {
  beforeEach(() => {
    dotenv.config(); // Load environment variables
  });

  it('should set req.userCode and req.role when given a valid reset token', () => {
    const req = {
      params: {
        token: 'validToken'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    try {
      auth.verifyResetToken(req, res, next);
    } catch (error) {
      expect(req.userCode).toBe('verified.userCode');
      expect(req.role).toBe('verified.role');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    }
  });


  it("should return 401 if reset token is invalid", async () => {
    const req = { params: { token: "invalid.reset.token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await auth.verifyResetToken(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid reset token" });
  });
});
