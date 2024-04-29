jest.mock("jsonwebtoken");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken"); // Add this line
const auth = require("./auth");

describe("auth.js", () => {
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
});
