const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
}

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Register a new user
regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
});

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract email parameter from request URL
    const isbn = req.params.isbn;
    const username = req.body.username;

    const book = books[isbn];

    if (book) // Check if book exists
    {
        let review = book.reviews[username];  // Retrieve friend object associated with email
        let reviewTU = req.body.review;

        // Update review if provided in request body
        if (reviewTU) {
            review = reviewTU;
        }

        book.reviews[username] = review;  // Update review details in 'books.reviews' object
        res.send(`Book review with the username ${username} updated.`);

    } else {
        // Respond if book with specified isbn is not found
        return res.send("Unable to find book!");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract isbn parameter from request URL
    const isbn = req.params.isbn;
    const username = req.body.username;

    const book = books[isbn];

    if (book) {
        // Delete review from 'reviews' object based on provided isbn
        delete book.reviews[username];
    }

    // Send response confirming deletion of review
    res.send(`Review for username ${username} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
