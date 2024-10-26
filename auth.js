// auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import db from './db.js';

const router = express.Router();

// Validate password strength
function isValidPassword(password) {
  // Password must be at least 8 characters long and contain uppercase, lowercase, and a number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

// User registration route
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate password strength
  if (!isValidPassword(password)) {
    return res.status(400).send('Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.');
  }

  // Check if username is already taken
  const query = 'SELECT * FROM users WHERE username = $1';
  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).send('Error checking user existence');
    }

    if (result.rows.length > 0) {
      return res.status(400).send('Username already exists');
    }

    // Hash the password before saving it
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // Insert new user into the database
      const insertQuery = 'INSERT INTO users (username, password) VALUES ($1, $2)';
      db.query(insertQuery, [username, hash], (err, result) => {
        if (err) {
          return res.status(500).send('Error saving user');
        }
        res.status(201).send('User registered successfully');
      });
    });
  });
});

// User login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const query = 'SELECT * FROM users WHERE username = $1';
  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).send('Error finding user');
    }

    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result.rows[0];

    // Compare the entered password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Error comparing passwords');
      }

      if (!isMatch) {
        return res.status(400).send('Invalid password');
      }

      // Save user information in session
      req.session.user = { id: user.id, username: user.username };
      res.status(200).send('Login successful');
    });
  });
});

export default router;
