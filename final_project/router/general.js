const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', function (req, res) {
    // Convert books object to JSON string with indentation for readability
    const booksList = JSON.stringify(books, null, 4);
    res.status(200).send(booksList);
  });
  

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = Number(req.params.isbn);

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/review/:isbn', (req, res) => {
  const isbn = Number(req.params.isbn);

  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).json(books[isbn].reviews);
  } else if (books[isbn]) {
    return res.status(200).json({ message: "No reviews available for this book" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const filteredBooks = Object.values(books).filter(book => 
    book.author.toLowerCase() === author
  );

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found by that author" });
  }
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const filteredBooks = Object.values(books).filter(book => 
    book.title.toLowerCase() === title
  );

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with that title" });
  }
});


module.exports.general = public_users;
