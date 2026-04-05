const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let feedbackEntries = [];

app.post("/feedback", (req, res) => {
  const { name, email, rating, comments } = req.body;

  if (!name || !email || !rating) {
    return res.status(400).json({ message: "name, email, and rating are required" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const entry = {
    id: req.body.id || Date.now(),
    name,
    email,
    rating: Number(rating),
    comments: comments || "",
    createdAt: req.body.createdAt || new Date().toISOString()
  };

  feedbackEntries.push(entry);
  return res.status(201).json(entry);
});

app.get("/feedback", (req, res) => {
  return res.json(feedbackEntries);
});

app.delete("/feedback/:id", (req, res) => {
  const id = Number(req.params.id);
  feedbackEntries = feedbackEntries.filter((entry) => Number(entry.id) !== id);
  return res.json({ message: "Feedback deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Feedback app server running at http://localhost:${PORT}`);
});
