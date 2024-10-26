// server.js

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js'; 
import authRoutes from './auth.js'; 
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware with a 10-minute timeout
app.use(
  session({
    secret: 'mysecretkey', // Use a secure, random secret in a production environment
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 60 * 1000 } // 10 minutes in milliseconds
  })
);

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.status(401).send('You need to log in to access this page');
}

// Add this route to your server.js
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.use('/api', authRoutes);

// Route to get all tasks (for the current user)
app.get('/api/tasks', isAuthenticated, (req, res) => {
  const query = `
    SELECT * FROM tasks 
    WHERE user_id = $1
  `;
  db.query(query, [req.session.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Error fetching tasks');
    }
    res.json(results.rows); // For PostgreSQL, use .rows to access results
  });
});

// Route to add a new task
app.post('/api/tasks', isAuthenticated, (req, res) => {
  const { title, description, due_date, status } = req.body;

  if (!title) {
    return res.status(400).send('Task title is required');
  }

  // Insert new task into the database
  const query = `
    INSERT INTO tasks (user_id, title, description, due_date, status) 
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [req.session.user.id, title, description || '', due_date, status];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saving task:', err);
      return res.status(500).send('Error saving task');
    }
    res.status(201).send('Task added successfully');
  });
});

// Logout route
app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out.');
    }
    res.send('Logged out successfully');
  });
});

// Route to delete a task
app.delete('/api/tasks/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const query = `
    DELETE FROM tasks 
    WHERE id = $1 AND user_id = $2
  `;
  db.query(query, [id, req.session.user.id], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).send('Error deleting task');
    }

    if (result.rowCount === 0) { // For PostgreSQL, use rowCount to check if any rows were affected
      return res.status(404).send('Task not found');
    }

    res.status(200).send('Task deleted successfully');
  });
});

// Route to update a task
app.put('/api/tasks/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;

  const query = `
    UPDATE tasks 
    SET title = $1, description = $2, due_date = $3, status = $4
    WHERE id = $5 AND user_id = $6
  `;
  const values = [title, description || '', due_date, status, id, req.session.user.id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).send('Error updating task');
    }

    if (result.rowCount === 0) { // For PostgreSQL, use rowCount to check if any rows were affected
      return res.status(404).send('Task not found or not authorized to edit');
    }

    res.status(200).send('Task updated successfully');
  });
});

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({ message: 'Database connected', time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// Server START!!
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
