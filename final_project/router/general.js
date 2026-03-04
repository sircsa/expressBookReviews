const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if user already exists
    const userExists = users.some(user => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Register the new user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
      } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
      } catch (err) {
        return res.status(404).json({ message: "Book not found", error: err.message });
      }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    try {
        const author = req.params.author;

        const getBooksByAuthor = new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = bookKeys
            .filter(key => books[key].author === author)
            .map(key => books[key]);

            if (matchingBooks.length > 0) resolve(matchingBooks);
            else reject("No books found for this author");
        });

        const matchingBooks = await getBooksByAuthor;
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        const getBooksByTitle = new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = bookKeys
            .filter(key => books[key].title === title)
            .map(key => books[key]);

            if (matchingBooks.length > 0) resolve(matchingBooks);
            else reject("No books found for this title");
        });

        const matchingBooks = await getBooksByTitle;
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;
