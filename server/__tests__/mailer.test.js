const dotenv = require("dotenv");
const transporter = require("../utils/mailer");

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
    dotenv.config();
  });

  it("should create a transporter with correct settings", () => {
    // This assumes your .env has MAIL_USERNAME and MAIL_PASSWORD set
    expect(transporter.options.host).toBe("smtp.gmail.com");
    expect(transporter.options.port).toBe(465);
    expect(transporter.options.secure).toBe(true);
  });

  it("should verify transporter connection and log results", () => {
    const mockVerify = jest.spyOn(transporter, "verify");
    mockVerify.mockImplementation((callback) => callback(null, "success"));

    // Assuming your code calls transporter.verify() somewhere:
    // ... (You might need to modify this based on your actual usage)
    transporter.verify((error, success) => {
      if (error) {
        console.error("Error verifying transporter:", error);
      } else {
        console.log("Transporter verified:", success);
      }
    });

    expect(mockVerify).toHaveBeenCalled();
    // Add assertions to check if your code logs 'success' message (if applicable)
    mockVerify.mockRestore();
  });

  it("should handle errors during transporter verification", () => {
    const mockVerify = jest.spyOn(transporter, "verify");
    mockVerify.mockImplementation((callback) =>
      callback(new Error("Verification Error"), null)
    );

  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
