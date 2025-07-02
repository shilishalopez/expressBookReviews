const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Add new user to users array
    users.push({ username, password });
  
    return res.status(201).json({ message: "User registered successfully" });
  });
  
  // Get the book list using async/await and Axios
  public_users.get('/', async (req, res) => {
    try {
      // Simulate Axios getting data from a local endpoint or mock API
      const response = await axios.get('http://localhost:5000/internal/books');
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });
  
  // Internal route for simulation (do not expose in real apps)
  public_users.get('/internal/books', (req, res) => {
    return res.status(200).json(books);
  });
  
  // Route to fetch a single book based on ISBN using async/await and Axios
  public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get(`http://localhost:5000/internal/book/${isbn}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Book not found", error: error.message });
    }
  });
  
  // Internal mock route to simulate API response
  public_users.get('/internal/book/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book);
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


public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();
  
    try {
      const response = await axios.get(`http://localhost:5000/internal/author/${encodeURIComponent(author)}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Author not found", error: error.message });
    }
  });
  
  // Internal mock route to simulate an API returning books by author
  public_users.get('/internal/author/:author', (req, res) => {
    const authorParam = req.params.author.toLowerCase();
    const matchingBooks = Object.values(books).filter(book => book.author.toLowerCase() === authorParam);
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found by that author" });
    }
  });
  
  
  
// Route: Get book details by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();
  
    try {
      const response = await axios.get(`http://localhost:5000/internal/title/${encodeURIComponent(title)}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Title not found", error: error.message });
    }
  });
  
  // Internal mock route to simulate title-based search
  public_users.get('/internal/title/:title', (req, res) => {
    const titleParam = req.params.title.toLowerCase();
    const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase() === titleParam);
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with that title" });
    }
  });


module.exports.general = public_users;
