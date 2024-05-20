const jwt = require("jsonwebtoken");
const path = require("path");
const { isAdmin } = require("../middleware/isAdmin");

jest.mock("jsonwebtoken");
jest.mock("path");
beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe("isAdmin middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {
        token: "validToken",
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

  it("should return 401 status and send 401notLoggedIn.html if token is not provided", async () => {
    req.cookies.token = undefined;

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "../../client/401notLoggedIn.html")
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user is an admin", async () => {
    jwt.verify.mockReturnValueOnce({ userCode: "123", role: "Admin" });

    await isAdmin(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 status and send error message if token is invalid", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
