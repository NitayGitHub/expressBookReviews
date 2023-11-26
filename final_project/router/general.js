const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

const fetchBooksData = () => Promise.resolve(books);

const fetchBookData = (isbn) => {
    const bookDetails = books[isbn];
    return Promise.resolve(bookDetails);
};

const fetchBooksByAuthor = (author) => {
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    return Promise.resolve(booksByAuthor);
};

const fetchBooksByTitle = (title) => {
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    return Promise.resolve(booksByTitle);
};

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      const localBooksData = await fetchBooksData();
      res.send(JSON.stringify(localBooksData, null, 4));
    } catch (error) {
      console.error('Error fetching books:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const bookDetails = await fetchBookData(isbn);
  
      return bookDetails
        ? res.json(bookDetails)
        : res.status(404).json({ message: 'Book not found' });
    } catch (error) {
      console.error('Error fetching book details:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
      const booksByAuthor = await fetchBooksByAuthor(author);
  
      return booksByAuthor.length > 0
        ? res.json(booksByAuthor)
        : res.status(404).json({ message: 'Books by the author not found' });
    } catch (error) {
      console.error('Error fetching books by author:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const booksByTitle = await fetchBooksByTitle(title);
  
      return booksByTitle.length > 0
        ? res.json(booksByTitle)
        : res.status(404).json({ message: 'Books with the title not found' });
    } catch (error) {
      console.error('Error fetching books by title:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // Check if the ISBN exists in the books object
    if (books.hasOwnProperty(isbn)) {
      const bookDetails = books[isbn];
      
      // Check if the book has reviews
      if (bookDetails.reviews && Object.keys(bookDetails.reviews).length > 0) {
        return res.json(bookDetails.reviews);
      } else {
        return res.status(404).json({ message: 'No reviews found for the specified book' });
      }
    } else {
      return res.status(404).json({ message: 'Book not found' });
    }
});

module.exports.general = public_users;
