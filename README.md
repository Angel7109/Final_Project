Task Management App
Overview
The Task Management App is a web-based application that allows users to manage their daily tasks efficiently. The app offers user registration and login functionality to ensure that each user’s tasks are private. Once logged in, users can create, view, update, and delete tasks, each with a title, description, due date, and status.

The application uses Express.js on the backend, PostgreSQL as the database, and Vercel for deployment.

Features
User authentication (registration and login).
Add, edit, and delete tasks.
Task status tracking (Pending, In-progress, Completed).
User sessions for private task management.
Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: PostgreSQL
Deployment: Vercel
Installation Instructions
Prerequisites
Before running this project locally, ensure you have the following installed:

Node.js (version 14 or higher)
npm (Node Package Manager)
PostgreSQL (Database)

Usage Guidelines
Registration:

Go to the registration page, enter a unique username and a strong password, and click Register.
Login:

Use your registered credentials to log in.
Managing Tasks:

Add a Task: Enter the task details, including title, description, due date, and status, and click Add Task.
Edit a Task: Click Edit next to a task, update the details, and click Update Task.
Delete a Task: Click Delete next to a task to remove it.
Logout:

Click Logout to end your session.
Folder Structure

Final_Project/
│
├── public/                      # Public folder containing static assets
│   ├── index.html               # Login and registration page
│   ├── tasks.html               # Task management page
│   ├── styles.css               # CSS for styling the pages
│
├── db.js                        # Database connection configuration
├── auth.js                      # Authentication routes
├── server.js                    # Main server file
├── .gitignore                   # Git ignore file
├── package.json                 # Project dependencies and scripts
└── .env                         # Environment variables for database

Credits

Developer: Angel7109

Database: PostgreSQL hosted on Vercel

Deployed on: Vercel
