const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let books = [
    { isbn: "12345", title: "Book One", author: "Author A", reviews: [] },
    { isbn: "67890", title: "Book Two", author: "Author B", reviews: [] }
];

app.get("/books", (req, res) => {
    res.json(books);
});

app.get("/books/isbn/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book) : res.status(404).send("Book not found");
});

app.get("/books/author/:author", (req, res) => {
    const filteredBooks = books.filter(b => b.author === req.params.author);
    filteredBooks.length ? res.json(filteredBooks) : res.status(404).send("No books found for this author");
});

app.get("/books/title/:title", (req, res) => {
    const filteredBooks = books.filter(b => b.title.includes(req.params.title));
    filteredBooks.length ? res.json(filteredBooks) : res.status(404).send("No books found with this title");
});

app.get("/books/review/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book.reviews) : res.status(404).send("No reviews found");
});

let users = [];
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).send("User already exists");
    }
    users.push({ username, password });
    res.status(201).send("User registered successfully");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    user ? res.send("Login successful") : res.status(401).send("Invalid credentials");
});

app.post("/books/review/:isbn", (req, res) => {
    const { username, review } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        book.reviews.push({ username, review });
        res.send("Review added successfully");
    } else {
        res.status(404).send("Book not found");
    }
});

app.delete("/books/review/:isbn", (req, res) => {
    const { username } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        book.reviews = book.reviews.filter(r => r.username !== username);
        res.send("Review deleted");
    } else {
        res.status(404).send("Book not found");
    }
});

const getAllBooks = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
};

app.get("/async-books", async (req, res) => {
    try {
        const bookList = await getAllBooks();
        res.json(bookList);
    } catch (error) {
        res.status(500).send("Error fetching books");
    }
});

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === isbn);
        book ? resolve(book) : reject("Book not found");
    });
};

app.get("/promise-books/isbn/:isbn", (req, res) => {
    getBookByISBN(req.params.isbn)
        .then(book => res.json(book))
        .catch(err => res.status(404).send(err));
});

const getBooksByAuthor = async (author) => {
    return books.filter(b => b.author === author);
};

app.get("/async-books/author/:author", async (req, res) => {
    try {
        const authorBooks = await getBooksByAuthor(req.params.author);
        res.json(authorBooks);
    } catch (error) {
        res.status(500).send("Error fetching books by author");
    }
});

const getBooksByTitle = async (title) => {
    return books.filter(b => b.title.includes(title));
};

app.get("/async-books/title/:title", async (req, res) => {
    try {
        const titleBooks = await getBooksByTitle(req.params.title);
        res.json(titleBooks);
    } catch (error) {
        res.status(500).send("Error fetching books by title");
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
