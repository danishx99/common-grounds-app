const fineController = require("../controllers/fineController");
const Fine = require("../models/Fine");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

jest.mock("../models/Fine");
jest.mock("../models/User");
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

describe("getFines", () => {
    // it("should fetch fines successfully", async () => {
    //     const fines = [{ id: 1, isPaid: false, dateIssued: new Date() }];
    //     Fine.find = jest.fn().mockResolvedValue(fines);
    //     const res = {
    //         status: jest.fn().mockReturnThis(),
    //         json: jest.fn(),
    //     };
    //     await fineController.getFines({}, res);
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         message: "Successfully got fines",
    //         fines: fines,
    //     });
    // });

    it("should handle error while fetching fines", async () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.getFines({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Error fetching fines",
        });
    });
});

describe("issueFine", () => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });

    it("should issue fine successfully", async () => {
        const req = {
            body: {
                userCode: "123",
                title: "Fine Title",
                description: "Fine Description",
                amount: 100,
            },
            cookies: {
                token: "token",
            },
        };
        const decoded = { userCode: "456" };
        jwt.verify.mockReturnValue(decoded);
        User.findOne = jest.fn().mockResolvedValue({});
        const saveMock = jest.fn().mockResolvedValue({});
        Fine.mockImplementationOnce(() => ({
            save: saveMock,
        }));
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.issueFine(req, res);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Fine issued successfully",
        });
    });

    it("should handle error while issuing fine", async () => {
        const req = {
            body: {
                userCode: "123",
                title: "Fine Title",
                description: "Fine Description",
                amount: 100,
            },
            cookies: {
                token: "token",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.issueFine(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error issuing fine" });
    });
});

describe("updateFineStatus", () => {
    it("should update fine status successfully", async () => {
        const req = {
            body: {
                fineId: "123",
            },
        };
        const fine = { id: "123", isPaid: false };
        Fine.findById = jest.fn().mockResolvedValue(fine);
        const saveMock = jest.fn().mockResolvedValue({});
        fine.save = saveMock;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.updateFineStatus(req, res);
        expect(fine.isPaid).toBe(true);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Fine status updated successfully",
        });
    });

    it("should handle error while updating fine status", async () => {
        const req = {
            body: {
                fineId: "123",
            },
        };
        const error = new Error("Error updating fine status");
        Fine.findById = jest.fn().mockRejectedValue(error);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.updateFineStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Error updating fine status",
        });
    });
});

describe("getUserFines", () => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });
    // it("should fetch user fines successfully", async () => {
    //     const fines = [{ id: 1, isRead: false, dateIssued: new Date() }];
    //     const token = "token";
    //     const decoded = { userCode: "123" };
    //     jwt.verify.mockReturnValue(decoded);
    //     Fine.find = jest.fn().mockResolvedValue(fines);
    //     const saveMock = jest.fn().mockResolvedValue({});
    //     fines.forEach((fine) => {
    //         fine.save = saveMock;
    //     });
    //     const res = {
    //         status: jest.fn().mockReturnThis(),
    //         json: jest.fn(),
    //     };
    //     await fineController.getUserFines({ cookies: { token } }, res);
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         message: "Successfully got user fines",
    //         fines: fines,
    //     });
    // });

    it("should handle error while fetching user fines", async () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.getUserFines({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Error fetching user fines",
        });
    });
});

describe("hasUnreadFines", () => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });

    it("should fetch unread fines count successfully", async () => {
        const token = "token";
        const decoded = { userCode: "123" };
        jwt.verify.mockReturnValue(decoded);
        const fines = [{ id: 1, isRead: false }];
        Fine.find = jest.fn().mockResolvedValue(fines);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.hasUnreadFines({ cookies: { token } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ unreadFines: fines.length });
    });

    it("should handle error while fetching unread fines", async () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await fineController.hasUnreadFines({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Error fetching unread fines",
        });
    });
});
