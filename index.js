const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const users = [];

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create user
app.post('/api/users', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.json({ error: 'Username is required' });
  }

  const existingUser = users.find(user => user.username === username);

  if (existingUser) {
    return res.json({ error: 'Username already exists' });
  }

  const newUser = {
    username,
    _id: generateId()
  };

  users.push(newUser);

  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/api/users/:_id', (req, res) => {
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  res.json(user);
});

// Get user exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  let { from, to, limit } = req.query;

  if (from && !isValidDate(from)) {
    return res.json({ error: 'Invalid "from" date format. Use yyyy-mm-dd' });
  }

  if (to && !isValidDate(to)) {
    return res.json({ error: 'Invalid "to" date format. Use yyyy-mm-dd' });
  }

  if (limit && isNaN(limit)) {
    return res.json({ error: 'Invalid "limit" value. Must be a number' });
  }

  let log = user.exercises || [];

  if (from) {
    log = log.filter(exercise => new Date(exercise.date) >= new Date(from));
  }

  if (to) {
    log = log.filter(exercise => new Date(exercise.date) <= new Date(to));
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  };

  res.json(response);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  if (!description || !duration) {
    return res.json({ error: 'Description and duration are required' });
  }

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  user.exercises = user.exercises || [];
  user.exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    ...exercise
  });
});

function generateId() {
  let id = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters.charAt(randomIndex);
  }

  return id;
}

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});