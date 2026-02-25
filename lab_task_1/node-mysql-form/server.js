const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Test route to check server working
app.get('/', (req, res) => {
  res.send("Server is working!");
});

// Create / Save
app.post('/submit', (req, res) => {
  const { user_id, email, phone } = req.body;
  const sql = "INSERT INTO users (user_id, email, phone) VALUES (?, ?, ?)";
  db.query(sql, [user_id, email, phone], (err) => {
    if (err) return res.send("Error saving data");
    res.send("Data Saved Successfully");
  });
});

// Read / Get all users
app.get('/users', (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }
    res.json(results);
  });
});

// Update user
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { user_id, email, phone } = req.body;
  const sql = "UPDATE users SET user_id = ?, email = ?, phone = ? WHERE id = ?";
  db.query(sql, [user_id, email, phone, id], (err) => {
    if (err) {
      console.log(err);
      return res.send("Error updating data");
    }
    res.send("Data Updated Successfully");
  });
});

// Delete user
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.send("Error deleting data");
    }
    res.send("Data Deleted Successfully");
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});