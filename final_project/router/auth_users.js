const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];  // Example user store: { username, password }

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username: username }, "your_jwt_secret_key", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.username;  // Assuming JWT middleware adds this
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
