const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// SQLite database
const db = new sqlite3.Database('database.db', (err) => {
    if(err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Table create
db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER
)`);

// CREATE
app.post('/submit', (req, res) => {
    const { name, age } = req.body;
    db.run(`INSERT INTO students (name, age) VALUES (?, ?)`, [name, age], function(err){
        if(err) return res.send(err.message);
        res.send('Student added successfully!');
    });
});

// READ
app.get('/students', (req, res) => {
    db.all(`SELECT * FROM students`, [], (err, rows) => {
        if(err) return res.send([]);
        res.json(rows);
    });
});

// UPDATE
app.post('/update', (req, res) => {
    const { id, name, age } = req.body;
    db.run(`UPDATE students SET name=?, age=? WHERE id=?`, [name, age, id], function(err){
        if(err) return res.send(err.message);
        res.send('Student updated successfully!');
    });
});

// DELETE
app.post('/delete', (req, res) => {
    const { id } = req.body;
    db.run(`DELETE FROM students WHERE id=?`, [id], function(err){
        if(err) return res.send(err.message);
        res.send('Student deleted successfully!');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});