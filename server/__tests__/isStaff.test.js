const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("../models/User");
const { isStaff } = require("../middleware/isStaff");

jest.mock("jsonwebtoken");
jest.mock("../models/User");
beforeEach(() => {
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
  
afterEach(() => {
    // Restore the original console.error function
    console.error.mockRestore();
});
describe("isStaff middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {
        token: "token",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      sendFile: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is not provided", async () => {
    req.cookies.token = undefined;

    await isStaff(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "../../client/html/error/401notLoggedIn.html")
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not a staff", async () => {
    jwt.verify.mockReturnValueOnce({ userCode: "123", role: "User" });

    await isStaff(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "../../client/html/error/403forbidden.html")
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user is a staff", async () => {
    jwt.verify.mockReturnValueOnce({ userCode: "123", role: "Staff" });

    await isStaff(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await isStaff(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
