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
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: generateId()
  };

  user.exercises = user.exercises || [];
  user.exercises.push(exercise);

  res.json(exercise);
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});