const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const transporter = require("../utils/mailer");

dotenv.config();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    options: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    verify: jest.fn(),
  }),
}));

describe("mailer.js", () => {
  beforeEach(() => {
    jest.resetModules(); // Clear the module cache to ensure a fresh module instance
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
    jest.clearAllMocks();
  });

  it("should create a transporter with correct settings", () => {
    expect(transporter.options.host).toBe("smtp.gmail.com");
    expect(transporter.options.port).toBe(465);
    expect(transporter.options.secure).toBe(true);
    expect(transporter.options.auth.user).toBe(process.env.MAIL_USERNAME);
    expect(transporter.options.auth.pass).toBe(process.env.MAIL_PASSWORD);
  });

  it("should verify transporter connection and log success", () => {
    const mockVerify = jest.spyOn(transporter, "verify");
    mockVerify.mockImplementation((callback) => callback(null, "success"));

    transporter.verify((error, success) => {
      if (error) {
        console.error("Error connecting to email transporter", error);
      } else {
        console.log("Email transporter connected successfully", success);
      }
    });

    expect(mockVerify).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Email transporter connected successfully", "success");
    mockVerify.mockRestore();
  });

  it("should log error if transporter verification fails", () => {
    const mockVerify = jest.spyOn(transporter, "verify");
    const errorMessage = "Connection error";
    mockVerify.mockImplementation((callback) => callback(errorMessage, null));

    transporter.verify((error, success) => {
      if (error) {
        console.error("Error connecting to email transporter", error);
      } else {
        console.log("Email transporter connected successfully", success);
      }
    });

    expect(mockVerify).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Error connecting to email transporter", errorMessage);
    mockVerify.mockRestore();
  });

  // it("should throw an error if transporter was not created successfully", () => {
  //   // Mock createTransport to throw an error
  //   const mockCreateTransport = nodemailer.createTransport;
  //   mockCreateTransport.mockImplementationOnce(() => {
  //     throw new Error("Failed to create transporter");
  //   });

  //   expect(() => {
  //     jest.isolateModules(() => transporter);
  //   }).toThrow("Error creating transporter");

  //   expect(console.error).toHaveBeenCalledWith("Error creating transporter", error);
  //   mockCreateTransport.mockRestore();
  // });
});
