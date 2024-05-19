const jwt = require("jsonwebtoken");
const path = require("path");
const { isResident } = require("../middleware/isResident");

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
describe("isResident middleware", () => {
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

    await isResident(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "../../client/401notLoggedIn.html")
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user role is 'Resident'", async () => {
    jwt.verify.mockReturnValueOnce({ userCode: "123", role: "Resident" });

    await isResident(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token verification fails", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await isResident(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
