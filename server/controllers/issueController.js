const Issue = require("../models/Issue");
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

exports.getIssues = async (req, res) => {
  try {
    // Get all issues and sort by date (latest first)
    const issues = await Issue.find().sort({ createdAt: "desc" }).exec();
    res
      .status(200)
      .json({ message: "Successfully got issues", issues: issues });
  } catch (error) {
    console.error("Error getting issues:", error);
    res.status(500).json({ error: "Error getting issues" });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (error) {
    console.error("Error getting issue:", error);
    res.status(500).json({ error: "Error getting issue" });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, status, assignedTo },
      { new: true }
    );
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (error) {
    console.error("Error updating issue:", error);
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
