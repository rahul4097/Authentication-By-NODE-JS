const express = require('express')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretKey = 'YOUR_SECRET_KEY'
const fs = require('fs')



// Load users from JSON file
let users = [];
const usersFile = 'users.txt';
try {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '');
  }
  const data = fs.readFileSync(usersFile, 'utf8');
  users = data.split('\n').filter(Boolean).map(JSON.parse);
} catch (error) {
  console.error('Error loading users file:', error);
  process.exit(1);
}

// Middleware for parsing POST data
// app.use(express.json());

// Route for handling signup form submission
 const signup =  async (req, res) => {
  const { username, email ,password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send({ message: 'Username, email and password are required' });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.username === username);
  const existingEmail = users.find(user => user.email === email);

  if (existingUser || existingEmail) {
    return res.status(409).send({ message: 'This user is already exists' });
  }

  // Hash password before storing
  const hashedPassword = await bcryptjs.hash(password.toString(),10);

  // Generate JWT
  const token = jwt.sign({ username }, secretKey, { expiresIn: '5s' });

  // Create new user object
  const newUser = { username,email, password: hashedPassword, token };

  // Add user to users array
  users.push(newUser);

  // Save users data to JSON file
  fs.appendFileSync(usersFile, JSON.stringify(newUser));

  // Send response with token
  res.json({ message: 'Signup successful!', token});
};


// Route for handling login form submission   
const login =  async (req, res) => {
  const { username,email, password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send({ message: 'Username and password are required' });
  }

  // Find user by username
  const userIdx = users.findIndex(user => user.username === username);
  const user = users[userIdx];
  if (userIdx === -1) {
    return res.status(401).send({ message: ' on login Invalid username or password' });
  }

  // Compare password
  const isValidPassword = await bcryptjs.compare(password.toString(), user.password);
  if (!isValidPassword) {
    return res.status(401).send({ message: 'Invalid username or password' });
  }

  // Generate JWT
  const token = jwt.sign({ username }, secretKey, { expiresIn: '8h' });

  // Update the JWT token
  users[userIdx] = { ...users[userIdx], token };

  // Save users data to JSON file
  fs.writeFileSync(usersFile, users.map((user) => JSON.stringify(user)).join('\n'));

  // Send response with token
  res.json({ message: 'Login successful!', token });
};

module.exports = { signup, login }