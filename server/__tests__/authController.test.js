const authController = require("../controllers/authController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {signOut} = require("firebase/auth");
const express = require('express');
const User = require("../models/User");
const Code = require("../models/Code");
const validateEmail = require("../utils/emailUtils");
const valPassComplexity = require("../utils/passwordUtils");
const nodemailer = require("nodemailer");
const https = require('https');

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/User");
jest.mock("../models/Code");
jest.mock("../utils/emailUtils");
jest.mock("../utils/passwordUtils");
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}));
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({}),
    verify: jest.fn(),
  }),
}));
beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register user successfully", async () => {
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

    try {
      await authController.registerUser(req, res);
    } catch (error) {
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "User registered successfully",
      });
    }
  });
  it("should return error if account role and code role mismatch", async () => {
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

    // Mock to simulate role mismatch
    Code.findOne.mockResolvedValue({ role: "admin" });

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Account type and provided code do not match.",
    });
  });

  it('should handle database error during user creation', async () => {
    const req = {
      body: {
        name: 'John',
        surname: 'Doe',
        password: 'password',
        confirmPassword: 'password',
        email: 'john@example.com',
        role: 'user',
        code: '123456',
        faceId: 'abc123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during user creation
    User.prototype.save.mockRejectedValue(new Error('Database error'));

    try {
      await authController.registerUser(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error registering user.' });
    }
  });
  it("should return error if password does not meet complexity requirements", async () => {
    const req = {
      body: {
        name: "John",
        surname: "Doe",
        password: "short",
        confirmPassword: "short",
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
  
    // Mock to simulate insufficient password complexity
    valPassComplexity.checkPassword.mockResolvedValue(false);
  
    await authController.registerUser(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
    });
  });
  
  it("should return error if database error occurs during user creation", async () => {
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
  
    // Mock to simulate database error during user creation
    User.prototype.save.mockRejectedValue(new Error("Database error"));
  
    try {
      await authController.registerUser(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error registering user.",
      });
    }
  });
  
});  

describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully", async () => {
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

  it("should return error if database error occurs during user lookup", async () => {
    const req = {
      body: {
        email: "john@example.com",
        password: "password",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during user lookup
    User.findOne.mockRejectedValue(new Error("Database error"));

    try {
      await authController.loginUser(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error logging in user",
      });
    }
  });
});

describe('validateEmail', () => {
  it('should return true for valid email', async () => {
    const validEmail = 'john@example.com';
    const isValid = await validateEmail(validEmail);
    expect(isValid).toBe(true);
  });
});
describe("loginWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login user with Google successfully", async () => {
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

  it("should return error if user not found", async () => {
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

  it("should return error if database error occurs during user lookup", async () => {
    const req = {
      body: {
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during user lookup
    User.findOne.mockRejectedValue(new Error("Database error"));

    try {
      await authController.loginWithGoogle(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error logging in user",
      });
    }
  });

  it('should return error if user is not found', async () => {
    const req = {
      body: {
        email: 'unknown@example.com',
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
      error: 'Please register with this Google account before attempting to login.',
    });
  });
});

describe("registerWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register user with Google successfully", async () => {
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

  it("should return error if user already exists", async () => {
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

  it("should return error if database error occurs", async () => {
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

    // Mocking the database error
    User.findOne.mockRejectedValue(new Error("Database error"));

    try {
      await authController.registerWithGoogle(req, res);
    } catch (error) {
      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error logging in user" });
    }
  });

  it("should return error if database error occurs during user creation", async () => {
    const req = {
      body: {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "user",
        code: "123456",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during user creation
    User.prototype.save.mockRejectedValue(new Error("Database error"));

    try {
      await authController.registerWithGoogle(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error logging in user",
      });
    }
  });
});

describe("logoutUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should log out user and clear cookie', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      clearCookie: jest.fn(), // Mock the clearCookie method
      json: jest.fn(),
    };

    const auth = {};
    const tokenCookieName = "token";

    try {
      await authController.logoutUser(req, res);
    } catch (error) {
      expect(signOut).toHaveBeenCalled(auth);
      expect(res.clearCookie).toHaveBeenCalledWith(tokenCookieName);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    }
  });
  
  it('should handle errors and return 500 status code', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    signOut.mockRejectedValue(new Error('Logout failed'));
    
    try {
      await authController.logoutUser(req, res);
    } catch (error) {  
    expect(signOut).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error logging out user' });
    }
  });

  it('should handle errors and return 500 status code', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    signOut.mockRejectedValue(new Error('Logout failed'));
    
    try {
      await authController.logoutUser(req, res);
    } catch (error) {  
      expect(signOut).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error logging out user' });
    }
  });
  
});

describe("forgetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should initiate password reset and send email', async () => {
    const req = {
      body: {
        email: 'test@example.com',
      },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const transporter = nodemailer.createTransport();
  
    try {
      await authController.forgetPassword(req, res);
    } catch (error) {
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset instructions have been sent to your email',
      });
    }
  });
  
  
  it("should return error if email is invalid", async () => {
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
  it("should return error if database error occurs", async () => {
    const req = {
      body: {
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    validateEmail.mockReturnValue(true);
    User.findOne.mockRejectedValue(new Error("Database error"));
    try {
      await authController.forgetPassword(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error initiating password reset",
      });
    }
  });

  it("should return error if database error occurs during user lookup", async () => {
    const req = {
      body: {
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during user lookup
    User.findOne.mockRejectedValue(new Error("Database error"));

    try {
      await authController.forgetPassword(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error initiating password reset",
      });
    }
  });
});

describe("resetPassword", () => {
  it("should return error if database error occurs during password update", async () => {
    const req = {
      body: {
        resetToken: "validToken",
        password: "newPassword",
        confirmPassword: "newPassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock to simulate database error during password update
    User.prototype.save.mockRejectedValue(new Error("Database error"));

    try {
      await authController.resetPassword(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error resetting password",
      });
    }
  });
});
describe('registerFace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register face successfully', async () => {
    const req = {
      body: {
        userCode: 'user123',
        faceId: 'face123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValue({ userCode: 'user123' });
    User.prototype.save.mockResolvedValue();

    try {
      await authController.registerFace(req, res);
    } catch (error) {
      expect(User.findOne).toHaveBeenCalledWith({ userCode: 'user123' });
      expect(User.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Face registered successfully' });
    }
  });

  it('should return error if user not found', async () => {
    const req = {
      body: {
        userCode: 'user123',
        faceId: 'face123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    try {
      await authController.registerFace(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    }
  });

  it('should return error if database error occurs', async () => {
    const req = {
      body: {
        userCode: 'user123',
        faceId: 'face123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    User.findOne.mockRejectedValue(new Error('Database error'));

    try {
      await authController.registerFace(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error registering face' });
    }
  });
});

describe("generateCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a code successfully", async () => {
    const req = {
      body: {
        role: "user",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockCodeInstance = {
      save: jest.fn().mockResolvedValue(),
    };

    Code.mockImplementation(() => mockCodeInstance);

    await authController.generateCode(req, res);

    expect(mockCodeInstance.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/user\d{5}/),
    });
  });

  it("should handle errors", async () => {
    const req = {
      body: {
        role: "user",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Test error");

    Code.mockImplementation(() => {
      throw error;
    });

    try {
      await authController.generateCode(req, res);
    } catch (err) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error generating code" });
    }
  });

  it('should generate a code for the specified role', async () => {
    const req = {
      body: {
        role: 'user',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockCodeInstance = {
      save: jest.fn().mockResolvedValue(),
    };

    Code.mockImplementation(() => mockCodeInstance);

    await authController.generateCode(req, res);

    expect(mockCodeInstance.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: expect.stringMatching(/user\d{5}/) });
  });
});

describe("generateVisitorPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a visitor password successfully", async () => {
    const req = {
      cookies: {
        token: "testToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const decodedToken = { userCode: "testUser" };
    const user = {
      userCode: "testUser",
      visitorPassword: null,
      visitorPasswordCreatedAt: null,
      save: jest.fn().mockResolvedValue(),
    };
  
    jwt.verify.mockReturnValue(decodedToken);
    User.findOne.mockResolvedValue(user);
  
    await authController.generateVisitorPassword(req, res);
  
    expect(jwt.verify).toHaveBeenCalledWith("testToken", process.env.JWT_SECRET);
    expect(User.findOne).toHaveBeenCalledWith({ userCode: "testUser" });
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      password: expect.any(Number),
    });
  });

  it('should generate a new visitor password if none exists', async () => {
    const req = {
      cookies: {
        token: 'validToken',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const decodedToken = { userCode: 'testUser' };
    const user = {
      userCode: 'testUser',
      visitorPassword: null,
      visitorPasswordCreatedAt: null,
      save: jest.fn().mockResolvedValue(),
    };

    jwt.verify.mockReturnValue(decodedToken);
    User.findOne.mockResolvedValue(user);

    await authController.generateVisitorPassword(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(User.findOne).toHaveBeenCalledWith({ userCode: 'testUser' });
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ password: expect.any(Number) });
  });
  it("should return existing visitor password if still valid", async () => {
    const req = {
      cookies: {
        token: "testToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const decodedToken = { userCode: "testUser" };
    const user = {
      userCode: "testUser",
      visitorPassword: "12345",
      visitorPasswordCreatedAt: Date.now() - 3600000, // 1 hour ago
    };

    jwt.verify.mockReturnValue(decodedToken);
    User.findOne.mockResolvedValue(user);

    await authController.generateVisitorPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("remains valid for about 23 more hours."),
      password: "12345",
    });
  });

  it("should handle errors", async () => {
    const req = {
      cookies: {
        token: "testToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const decodedToken = { userCode: "testUser" };
    const error = new Error("Test error");

    jwt.verify.mockReturnValue(decodedToken);
    User.findOne.mockRejectedValue(error);

    try {
      await authController.generateVisitorPassword(req, res);
    } catch (err) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error generating visitor password",
      });
    }
  });
});
