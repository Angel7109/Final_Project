// server.js

import express from 'express';
import session from 'express-session';
import db from './db.js'; 
import authRoutes from './auth.js'; 

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static('public'));

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
    res.sendFile(__dirname + '/index.html');
  });
  
// Authentication routes
app.use('/api', authRoutes);

// Route to get all tasks (for the current user)
app.get('/api/tasks', isAuthenticated, (req, res) => {
  const query = 'SELECT * FROM tasks WHERE user_id = ?';
  db.query(query, [req.session.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Error fetching tasks');
    }
    res.json(results);
  });
});

// Route to add a new task
app.post('/api/tasks', isAuthenticated, (req, res) => {
  const { title, description, due_date, status } = req.body;

  if (!title) {
    return res.status(400).send('Task title is required');
  }

  // Insert new task into the database
  const query = 'INSERT INTO tasks (user_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)';
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
    const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  
    db.query(query, [id, req.session.user.id], (err, result) => {
      if (err) {
        console.error('Error deleting task:', err);
        return res.status(500).send('Error deleting task');
      }
  
      if (result.affectedRows === 0) {
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
      SET title = ?, description = ?, due_date = ?, status = ?
      WHERE id = ? AND user_id = ?
    `;
    const values = [title, description || '', due_date, status, id, req.session.user.id];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).send('Error updating task');
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send('Task not found or not authorized to edit');
      }
  
      res.status(200).send('Task updated successfully');
    });
  });
  
  

// Server START!!
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
