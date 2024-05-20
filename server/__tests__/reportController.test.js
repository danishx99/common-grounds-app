const reportController = require('../controllers/reportController');
const Issue = require('../models/Issue');
const Visitor = require('../models/Visitor');
const Fine = require('../models/Fine');
const User = require('../models/User');

beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe('Issue Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        year: '2023',
        userCode: 'user123'
      }
    };
    res = {
      statusCode: null,
      jsonData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };
  });

  describe('getIssueVisitorFinesReport', () => {
    it('should return issues, visitors, and fines data for the given year', async () => {
      const issueData = [
        { _id: 1, completed: 2, notCompleted: 3 },
        { _id: 2, completed: 4, notCompleted: 5 }
      ];
      const visitorData = [
        { _id: 1, totalVisitors: 10 },
        { _id: 2, totalVisitors: 15 }
      ];
      const fineData = [
        { _id: 1, outstanding: 2, notOutstanding: 3 },
        { _id: 2, outstanding: 4, notOutstanding: 5 }
      ];

      Issue.aggregate = () => Promise.resolve(issueData);
      Visitor.aggregate = () => Promise.resolve(visitorData);
      Fine.aggregate = () => Promise.resolve(fineData);

      await reportController.getIssueVisitorFinesReport(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData).toEqual({ issues: issueData, visitors: visitorData, fines: fineData });
    });

    it('should handle errors and return a 500 status', async () => {
      const error = new Error('Something went wrong');
      Issue.aggregate = () => Promise.reject(error);

      await reportController.getIssueVisitorFinesReport(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.jsonData).toEqual({ error: 'Error fetching report data' });
    });
  });

  describe('getFinesReport', () => {
    it('should return fines data for the given user and year', async () => {
      const fineData = [
        { _id: 1, outstanding: 2, notOutstanding: 3 },
        { _id: 2, outstanding: 4, notOutstanding: 5 }
      ];

      User.findOne = () => Promise.resolve({ userCode: 'user123' });
      Fine.aggregate = () => Promise.resolve(fineData);

      await reportController.getFinesReport(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData).toEqual({ fines: fineData });
    });

    it('should handle user not found and return a 404 status', async () => {
      User.findOne = () => Promise.resolve(null);

      await reportController.getFinesReport(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.jsonData).toEqual({ error: 'User not found' });
    });

    it('should handle errors and return a 500 status', async () => {
      const error = new Error('Something went wrong');
      User.findOne = () => Promise.resolve({ userCode: 'user123' });
      Fine.aggregate = () => Promise.reject(error);

      await reportController.getFinesReport(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.jsonData).toEqual({ error: 'Error fetching fines' });
    });
  });
});
