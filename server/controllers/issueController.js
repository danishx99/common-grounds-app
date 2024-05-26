const Issue = require("../models/Issue");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.createIssue = async (req, res) => {
  try {
    const { title, description } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.userCode;

    const newIssue = new Issue({
      title,
      description,
      reportedBy: user,
    });

    await newIssue.save();
    res.status(201).json({ message: "Issue created successfully" });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: "Error creating issue" });
  }
};

exports.getUserIssues = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.userCode;
    const issues = await Issue.find({ reportedBy: user })
      .sort({ createdAt: "desc" })
      .exec();
    res
      .status(200)
      .json({ message: "Successfully got user issues", issues: issues });
  } catch (error) {
    console.error("Error getting user issues:", error);
    res.status(500).json({ error: "Error getting user issues" });
  }
};

exports.getAllIssues = async (req, res) => {
  try {
    // Get all issues and sort by date (latest first)
    let issues = await Issue.find().sort({ createdAt: "desc" }).exec();

    // loop through each issue, and find the name and surname using the userCode stored in the reportedBy field
    for (let i = 0; i < issues.length; i++) {
      let user = await User.findOne({ userCode: issues[i].reportedBy });
      let name;
      if (!user) {
        name = "Unknown User";
      } else {
        name = user.name + " " + user.surname;
      }
      issues[i] = { ...issues[i], name };
    }

    res
      .status(200)
      .json({ message: "Successfully got issues", issues: issues });
  } catch (error) {
    console.error("Error getting issues:", error);
    res.status(500).json({ error: "Error getting issues" });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId, status } = req.body;

    const issue = await Issue.findOne({ _id: issueId });

    issue.status = status;

    await issue.save();

    res.status(200).json({ message: "Issue status updated successfully" });
  } catch (error) {
    console.log("Error updating issue:", error);
    res.status(500).json({ error: "Error updating issue" });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ error: "Error deleting issue" });
  }
};
