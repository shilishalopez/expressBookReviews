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

// regd_users.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: "Username and password are required" });
//   }

//   if (authenticatedUser(username, password)) {
//     const token = jwt.sign({ username: username }, "your_jwt_secret_key", { expiresIn: "1h" });
//     return res.status(200).json({ message: "Login successful", token: token });
//   } else {
//     return res.status(401).json({ message: "Invalid username or password" });
//   }
// });
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user exists and password matches
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "your_jwt_secret_key", { expiresIn: "1h" });

  // Save token in session (assuming express-session middleware is used)
  req.session.authorization = {
    token,
    username
  };

  return res.status(200).json({ message: "User logged in successfully", token });
});

// regd_users.put("/auth/review/:isbn", (req, res) => {
//   const username = req.user.username;  // Assuming JWT middleware adds this
//   const isbn = req.params.isbn;
//   const review = req.body.review;

//   if (!review) {
//     return res.status(400).json({ message: "Review text is required" });
//   }

//   if (!books[isbn]) {
//     return res.status(404).json({ message: "Book not found" });
//   }

//   books[isbn].reviews = books[isbn].reviews || {};
//   books[isbn].reviews[username] = review;

//   return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
// });
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Check if review query param is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required in query parameters" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Get username from session (set during login)
  const username = req.session.authorization ? req.session.authorization.username : null;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Check if book exists
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Get username from session (set at login)
    const username = req.session.authorization?.username;
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    // Check if user has a review to delete
    if (!book.reviews[username]) {
      return res.status(404).json({ message: "No review found for this user" });
    }
  
    // Delete the user's review
    delete book.reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
