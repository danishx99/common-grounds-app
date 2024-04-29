const authController = require("./authController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Code = require("../models/Code");
const validateEmail = require("../utils/emailUtils");
const valPassComplexity = require("../utils/passwordUtils");

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/User");
jest.mock("../models/Code");
jest.mock("../utils/emailUtils");
jest.mock("../utils/passwordUtils");

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register user successfully", async () => {
    // Mock input data
    const req = {
      body: {
        name: "John",
        surname: "Doe",
        password: "password",
        confirmPassword: "password",
        email: "john@example.com",
        role: "user",
        code: "123456",
        faceId: "abc123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock dependencies
    validateEmail.mockResolvedValue(true);
    User.findOne.mockResolvedValue(null);
    valPassComplexity.checkPassword.mockResolvedValue(true);
    Code.findOne.mockResolvedValue({ role: "user" });
    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.prototype.save.mockResolvedValue();
    Code.deleteOne.mockResolvedValue();

    // Call the function
    await authController.registerUser(req, res);

    // Assertion
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
  });

  // Add more test cases for other scenarios...
});

describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should login user successfully", async () => {
    // Mock input data
    const req = {
      body: {
        email: "john@example.com",
        password: "password",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    // Mock dependencies
    User.findOne.mockResolvedValue({
      password: "hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("jwtToken");

    // Call the function
    await authController.loginUser(req, res);

    // Assertion
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, redirect: "user" });
    expect(res.cookie).toHaveBeenCalledWith("token", "jwtToken", {
      httpOnly: true,
      maxAge: 86400000,
    });
  });

  // Add more test cases for other scenarios...
});

describe("loginWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should login user with Google successfully", async () => {
    const req = {
      body: {
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    User.findOne.mockResolvedValue({
      userCode: "user123",
      role: "user",
    });
    jwt.sign.mockReturnValue("jwtToken");

    await authController.loginWithGoogle(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith("token", "jwtToken", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, redirect: "user" });
  });

  test("should return error if user not found", async () => {
    const req = {
      body: {
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await authController.loginWithGoogle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Please register with this Google account before attempting to login.",
    });
  });
});

describe("registerWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register user with Google successfully", async () => {
    const req = {
      body: {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "user",
        code: "code123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking the User.findOne method to return null, indicating that the user doesn't exist yet
    User.findOne.mockResolvedValue(null);

    // Mocking the Code.findOne method to return a valid code
    Code.findOne.mockResolvedValue({ userCode: "code123", role: "user" });

    // Mocking the save method of the new user
    User.prototype.save.mockResolvedValue();

    // Mocking the deleteOne method of Code
    Code.deleteOne.mockResolvedValue();

    await authController.registerWithGoogle(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(Code.findOne).toHaveBeenCalledWith({ userCode: "code123" });
    expect(User.prototype.save).toHaveBeenCalled();
    expect(Code.deleteOne).toHaveBeenCalledWith({ userCode: "code123" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
  });

  test("should return error if user already exists", async () => {
    const req = {
      body: {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "user",
        code: "code123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking the User.findOne method to return an existing user
    User.findOne.mockResolvedValue({});

    await authController.registerWithGoogle(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "This account already exists. Please login using this account instead.",
    });
  });

  // test("should return error if database error occurs", async () => {
  //   const req = {
  //     body: {
  //       name: "John",
  //       surname: "Doe",
  //       email: "john@example.com",
  //       role: "user",
  //       code: "code123",
  //     },
  //   };
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };

  //   // Mocking the database error
  //   User.findOne.mockRejectedValue(new Error("Database error"));

  //   await authController.registerWithGoogle(req, res);

  //   // Assertions
  //   expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ error: "Error logging in user" });
  // });
});

// describe("logoutUser", () => {
//   test("should handle error and return status 500", async () => {
//     const req = {};
//     const res = {
//       clearCookie: jest.fn().mockImplementation(() => {
//         throw new Error("Cookie clear error");
//       }),
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await authController.logoutUser(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ error: "Error logging out user" });
//   });
// });

describe("forgetPassword", () => {
  test("should return error if email is invalid", async () => {
    const req = {
      body: {
        email: "invalidEmail",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    validateEmail.mockReturnValue(false);
    await authController.forgetPassword(req, res);
    expect(validateEmail).toHaveBeenCalledWith("invalidEmail");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please provide a valid email",
    });
  });
  // test("should return error if database error occurs", async () => {
  //   const req = {
  //     body: {
  //       email: "john@example.com",
  //     },
  //   };
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };
  //   validateEmail.mockReturnValue(true);
  //   User.findOne.mockRejectedValue(new Error("Database error"));
  //   await authController.forgetPassword(req, res);
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({
  //     error: "Error initiating password reset",
  //   });
  // });
});
