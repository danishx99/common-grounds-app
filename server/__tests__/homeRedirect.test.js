const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { homeRedirect } = require("../middleware/homeRedirect");

jest.mock("jsonwebtoken");
jest.mock("dotenv");
beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe("homeRedirect", () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: {
        token: "token",
      },
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to /login if token is not provided", async () => {
    req.cookies.token = undefined;

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should redirect to /admin if user role is Admin", async () => {
    const verified = {
      userCode: "123",
      role: "Admin",
    };
    jwt.verify.mockReturnValue(verified);

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/admin");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should redirect to /staff if user role is Staff", async () => {
    const verified = {
      userCode: "123",
      role: "Staff",
    };
    jwt.verify.mockReturnValue(verified);

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/staff");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should redirect to /resident if user role is Resident", async () => {
    const verified = {
      userCode: "123",
      role: "Resident",
    };
    jwt.verify.mockReturnValue(verified);

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/resident");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return 401 status and error message if token is invalid", async () => {
    const error = new Error("Invalid token");
    jwt.verify.mockImplementation(() => {
      throw error;
    });

    await homeRedirect(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it("should return 401 status and error message if an error occurs during authentication", async () => {
    const error = new Error("Error authenticating user");
    jwt.verify.mockImplementation(() => {
      throw error;
    });

    await homeRedirect(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });
});
