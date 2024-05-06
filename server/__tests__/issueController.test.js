const issueController = require("../controllers/issueController");
const Issue = require("../models/Issue");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

jest.mock("../models/Issue");
jest.mock("../models/User");
jest.mock("jsonwebtoken");

describe("createIssue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an issue successfully", async () => {
    const req = {
      body: {
        title: "Test Issue",
        description: "This is a test issue",
      },
      cookies: {
        token: "testToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jwt.verify.mockReturnValue({ userCode: "testUser" });
    Issue.mockReturnValueOnce({ save: jest.fn().mockResolvedValue() });

    await issueController.createIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Issue created successfully",
    });
  });

  it("should handle errors", async () => {
    const req = {
      body: {
        title: "Test Issue",
        description: "This is a test issue",
      },
      cookies: {
        token: "testToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Test error");

    jwt.verify.mockImplementation(() => {
      throw error;
    });

    try {
      await issueController.createIssue(req, res);
    } catch (err) {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating issue" });
    }
  });
});

describe("getUserIssues", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // it("should get user issues successfully", async () => {
    //     const req = {
    //       cookies: {
    //         token: "testToken",
    //       },
    //     };
    //     const res = {
    //       status: jest.fn().mockReturnThis(),
    //       json: jest.fn(),
    //     };
    //     const userIssues = [
    //       { _id: "issue1", title: "Issue 1", description: "This is the first issue" },
    //       { _id: "issue2", title: "Issue 2", description: "This is the second issue" },
    //     ];
    //     const decodedToken = { userCode: "testUser" };
    
    //     jwt.verify.mockReturnValue(decodedToken);
    //     Issue.find.mockResolvedValue(userIssues);
    
    //     await issueController.getUserIssues(req, res);
    
    //     expect(jwt.verify).toHaveBeenCalledWith("testToken", process.env.JWT_SECRET);
    //     expect(Issue.find).toHaveBeenCalledWith({ reportedBy: "testUser" });
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //       message: "Successfully got user issues",
    //       issues: userIssues,
    //     });
    // });

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
    const error = new Error("Test error");

    jwt.verify.mockImplementation(() => {
        throw error;
    });

    try {
        await issueController.getUserIssues(req, res);
    } catch (err) {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error getting user issues" });
    }
    });
});

// describe("getAllIssues", () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//       });
    
//     it("should get all issues successfully", async () => {
//     const req = {
//         cookies: {
//             token: "mockToken"
//         }
//     };
//     const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//     };

//     // Mock jwt.verify() to return decoded user code
//     jwt.verify = jest.fn().mockReturnValue({ userCode: "mockUserCode" });

//     // Mock Issue.find() to return mock issues
//     Issue.find = jest.fn().mockReturnValue({
//         sort: jest.fn().mockReturnThis(),
//         exec: jest.fn().mockResolvedValue([
//           { issueId: 1, reportedBy: "mockUserCode" },
//           { issueId: 2, reportedBy: "mockUserCode" }
//         ])
//     });

//     await issueController.getAllIssues(req, res);

//     // Check that jwt.verify() is called with the correct arguments
//       expect(jwt.verify).toHaveBeenCalledWith("mockToken", process.env.JWT_SECRET);

//       // Check that Issue.find() is called with the correct arguments
//       expect(Issue.find).toHaveBeenCalledWith({ reportedBy: "mockUserCode" });

//       // Check that the response status is set to 200
//       expect(res.status).toHaveBeenCalledWith(200);

//       // Check that the response json is called with the correct arguments
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Successfully got user issues",
//         issues: [
//           { issueId: 1, reportedBy: "mockUserCode" },
//           { issueId: 2, reportedBy: "mockUserCode" }
//         ]
//       });
//     });

//     it("should handle errors", async () => {
//         // Mock request and response objects
//         const req = {
//             cookies: {}
//         };
//         const res = {
//             status: jest.fn().mockReturnThis(),
//             json: jest.fn()
//         };

//         // Mock jwt.verify() to throw an error
//         jwt.verify = jest.fn().mockImplementation(() => {
//             throw new Error("Invalid token");
//         });

//         await issueController.getAllIssues(req, res);
//         // Check that jwt.verify() is called with the correct arguments
//         expect(jwt.verify).toHaveBeenCalledWith(undefined, process.env.JWT_SECRET);
//         // Check that the response status is set to 500
//         expect(res.status).toHaveBeenCalledWith(500);
//         // Check that the response json is called with the correct arguments
//         expect(res.json).toHaveBeenCalledWith({ error: "Error getting user issues" });
//     });
// });
describe("updateIssueStatus", () => {
    beforeEach(() => {
        jest.clearAllMocks();
      });
    
      it("should update the issue status successfully", async () => {
        const req = {
          body: {
            issueId: "issue123",
            status: "resolved",
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const issue = {
          _id: "issue123",
          status: "open",
          save: jest.fn().mockResolvedValue(),
        };
    
        Issue.findOne.mockResolvedValue(issue);
    
        await issueController.updateIssueStatus(req, res);
    
        expect(Issue.findOne).toHaveBeenCalledWith({ _id: "issue123" });
        expect(issue.status).toBe("resolved");
        expect(issue.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Issue status updated successfully",
        });
      });
    
      it("should handle error when issue is not found", async () => {
        const req = {
          body: {
            issueId: "issue123",
            status: "resolved",
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        Issue.findOne.mockResolvedValue(null);
    
        await issueController.updateIssueStatus(req, res);
    
        expect(Issue.findOne).toHaveBeenCalledWith({ _id: "issue123" });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error updating issue" });
      });
    
      it("should handle errors", async () => {
        const req = {
          body: {
            issueId: "issue123",
            status: "resolved",
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const error = new Error("Test error");
    
        Issue.findOne.mockRejectedValue(error);
    
        try {
          await issueController.updateIssueStatus(req, res);
        } catch (err) {
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ error: "Error updating issue" });
        }
      });
});

describe("deleteIssue", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should delete an issue successfully", async () => {
      const req = {
        params: {
          id: "issue123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const deletedIssue = { _id: "issue123" };
  
      Issue.findByIdAndDelete.mockResolvedValue(deletedIssue);
  
      await issueController.deleteIssue(req, res);
  
      expect(Issue.findByIdAndDelete).toHaveBeenCalledWith("issue123");
      expect(res.json).toHaveBeenCalledWith({
        message: "Issue deleted successfully",
      });
    });
  
    it("should handle error when issue is not found", async () => {
      const req = {
        params: {
          id: "issue123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Issue.findByIdAndDelete.mockResolvedValue(null);
  
      await issueController.deleteIssue(req, res);
  
      expect(Issue.findByIdAndDelete).toHaveBeenCalledWith("issue123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Issue not found" });
    });
  
    it("should handle errors", async () => {
      const req = {
        params: {
          id: "issue123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Test error");
  
      Issue.findByIdAndDelete.mockRejectedValue(error);
  
      try {
        await issueController.deleteIssue(req, res);
      } catch (err) {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error deleting issue" });
      }
    });
  });
