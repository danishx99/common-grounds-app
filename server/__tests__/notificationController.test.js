const notificationController = require("../controllers/notificationController");
const Notification = require("../models/Notification");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

jest.mock("../models/Notification");
jest.mock("../models/User");
jest.mock("jsonwebtoken");
beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe("sendNotification", () => {
  it("should send notification successfully", async () => {
    const req = {
      cookies: {
        token: "token",
      },
      body: {
        title: "Notification Title",
        description: "Notification Description",
      },
    };
    const verified = { userCode: "123" };
    jwt.verify.mockReturnValue(verified);
    const saveMock = jest.fn().mockResolvedValue({});
    Notification.mockImplementationOnce(() => ({
      save: saveMock,
    }));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await notificationController.sendNotification(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification sent successfully",
    });
  });

  it("should handle error when sending notification", async () => {
    const req = {
      cookies: {
        token: "token",
      },
      body: {
        title: "Notification Title",
        description: "Notification Description",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.mockImplementationOnce(() => {
      throw new Error("Error sending notification");
    });

    await notificationController.sendNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error sending notification",
    });
  });
});

describe("getNotifications", () => {
  it("should handle error when fetching notifications", async () => {
    const req = {
      cookies: {
        token: "token",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Error fetching notifications");

    Notification.find.mockRejectedValue(error);

    try {
      await notificationController.getNotifications(req, res);
    } catch (error) {
      expect(Notification.find).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching notifications:",
        error
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching notifications",
      });
    }
  });
});

describe("getUnreadNotifications", () => {
  it("should fetch unread notifications successfully", async () => {
    const req = {
      cookies: {
        token: "token",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const notifications = [
      {
        _id: "1",
        title: "Notification 1",
        description: "Description 1",
        viewedBy: [],
      },
      {
        _id: "2",
        title: "Notification 2",
        description: "Description 2",
        viewedBy: ["456"],
      },
    ];

    Notification.find.mockResolvedValue(notifications);
    jwt.verify.mockReturnValue({ userCode: "123" });

    try {
      await notificationController.getUnreadNotifications(req, res);
    } catch (error) {
      expect(Notification.find).toHaveBeenCalledWith({
        viewedBy: { $ne: "123" },
      });
      expect(jwt.verify).toHaveBeenCalledWith("token", process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ unreadNotifications: 1 });
    }
  });

  it("should handle error when fetching unread notifications", async () => {
    const req = {
      cookies: {
        token: "token",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Error fetching unread notifications");

    Notification.find.mockRejectedValue(error);

    try {
      await notificationController.getUnreadNotifications(req, res);
    } catch (error) {
      expect(Notification.find).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching unread notifications:",
        error
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching unread notifications",
      });
    }
  });

  it("should handle missing token", async () => {
    const req = {
      cookies: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await notificationController.getUnreadNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error fetching unread notifications",
    });
  });
});
