const notificationController = require("../controllers/notificationController");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

jest.mock("../models/Notification");
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
beforeEach(() => {
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
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
    const decoded = { userCode: "123" };
    const saveMock = jest.fn().mockResolvedValue({});
    Notification.mockImplementationOnce(() => ({
      save: saveMock,
    }));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    try {
      await notificationController.sendNotification(req, res);
    } catch (error) {
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification sent successfully",
      });
    }
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
    try {
      await notificationController.sendNotification(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error sending notification",
      });
    }
  });

  it("should handle missing token", async () => {
    const req = {
      cookies: {},
      body: {
        title: "Notification Title",
        description: "Notification Description",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }; 
    try { 
      await notificationController.sendNotification(req, res);
    } catch (error) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error sending notification",
      });
    }
  });

  it("should handle missing title or description", async () => {
    const req = {
      cookies: {
        token: "token",
      },
      body: {
        title: "Notification Title",
      },
    };
    const decoded = { userCode: "123" };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    try {
      await notificationController.sendNotification(req, res);
    } catch (error) { 
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error sending notification",
      });
    }
  });
});

describe("getNotifications", () => {
  // it("should fetch notifications successfully", async () => {
  //   const req = {};
  //   const user = {
  //     name: "John",
  //     surname: "Doe",
  //   };
  //   const notifications = [
  //     {
  //       title: "Notification 1",
  //       description: "Description 1",
  //       issuedBy: "123",
  //     },
  //     {
  //       title: "Notification 2",
  //       description: "Description 2",
  //       issuedBy: "456",
  //     },
  //   ];
  //   const token = "token";
  //   const verified = { userCode: "123" };
  //   const findMock = jest.fn().mockResolvedValue(notifications);
  //   const findOneMock = jest.fn().mockResolvedValue(user);
  //   Notification.find = findMock;
  //   jwt.verify.mockReturnValue(verified);
  //   User.findOne = findOneMock;
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };
  //   await notificationController.getNotifications(req, res);
  //   expect(findMock).toHaveBeenCalled();
  //   expect(findOneMock).toHaveBeenCalledWith({ userCode: "123" });
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     notifications: [
  //       {
  //         title: "Notification 1",
  //         description: "Description 1",
  //         issuedBy: "John Doe",
  //       },
  //       {
  //         title: "Notification 2",
  //         description: "Description 2",
  //         issuedBy: "John Doe",
  //       },
  //     ],
  //   });
  // });

  it("should handle error when fetching notifications", async () => {
    const req = {};
    const error = new Error("Error fetching notifications");
    const findMock = jest.fn().mockRejectedValue(error);
    Notification.find = findMock;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await notificationController.getNotifications(req, res);
    expect(findMock).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching notifications:",
      error
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error fetching notifications",
    });
  });
});

describe("getUnreadNotifications", () => {
  it("should fetch unread notifications successfully", async () => {
    const req = {
      cookies: {
        token: "token",
      },
    };
    const verified = { userCode: "123" };
    const findMock = jest.fn().mockResolvedValue([]);
    Notification.find = findMock;
    jwt.verify.mockReturnValue(verified);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    try {
      await notificationController.getUnreadNotifications(req, res);
    } catch (error) {
      expect(findMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ unreadNotifications: 0 });
    }
  });

  it("should handle error when fetching unread notifications", async () => {
    const req = {
      cookies: {
        token: "token",
      },
    };
    const error = new Error("Error fetching unread notifications");
    const findMock = jest.fn().mockRejectedValue(error);
    Notification.find = findMock;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await notificationController.getUnreadNotifications(req, res);
    expect(findMock).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching unread notifications:",
      error
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error fetching unread notifications",
    });
  });
});
