import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const db = new sqlite3.Database('./listings.db');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

db.run(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL, 
    country TEXT NOT NULL,
    price REAL NOT NULL,
    username TEXT NOT NULL
  )
`);

  db.all(`PRAGMA table_info(listings)`, (err, cols) => {
    if (err) throw err;
    if (!cols.some(c => c.name === 'username')) {
      db.run(`ALTER TABLE listings ADD COLUMN username TEXT NOT NULL DEFAULT ''`);
    } 
  });


db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_pic TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/api/messages', (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  db.run(
    `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
    [sender_id, receiver_id, content],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        sender_id,
        receiver_id,
        content,
        timestamp: new Date().toISOString()
      });
    }
  );
});

app.get('/api/messages/:senderId/:receiverId', (req, res) => {
  const { senderId, receiverId } = req.params;

  db.all(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)
     ORDER BY timestamp ASC`,
    [senderId, receiverId, receiverId, senderId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});


// Get all listings
app.get('/api/listings', (req, res) => {
  db.all('SELECT * FROM listings', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/CreateListing', (req, res) => {
  const { title, description, city, country, price, username } = req.body;

  if (!title || !description || !city || !country ||
      typeof price !== 'number' || !username
  ) {
    return res.status(400).json({ error: 'All fields (including username) are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO listings
      (title, description, city, country, price, username)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [title, description, city, country, price, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});


// Register 
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `);

  stmt.run([name, email, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id: this.lastID, message: 'User registered successfully' });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
});

app.post("/updateProfilePicture", (req, res) => {
  const { userId, profile_picture } = req.body;

  if (!userId || !profile_picture) {
    return res.status(400).json({ error: "User ID and profile picture are required." });
  }

  db.run("UPDATE users SET profile_pic = ? WHERE id = ?", [profile_picture, userId], (err) => {
    if (err) {
      console.error("Error updating profile picture:", err.message);
      return res.status(500).json({ error: "Error updating profile picture in database." });
    }
    res.json({ message: "Profile picture updated successfully." });
  });
});

app.post('/api/updateDescription', (req, res) => {
  const { id, description } = req.body;

  if (!id || typeof description !== 'string') {
    return res.status(400).json({ error: 'Valid ID and description are required' });
  }

  db.run(
    'UPDATE users SET description = ? WHERE id = ?',
    [description, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Description updated successfully', description });
    }
  );
});

app.get('/api/getUserIdByName/:username', (req, res) => {
  const { username } = req.params;
  db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});


// Get user by ID (including profile picture)
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT id, name, email, profile_pic, description, current_task_id FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

app.post('/api/acceptTask', (req, res) => {
  const { userId, taskId } = req.body;
  if (!userId || !taskId) {
    return res.status(400).json({ error: 'userId and taskId are required' });
  }

  db.get(
    'SELECT username FROM listings WHERE id = ?',
    [taskId],
    (err, listing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      // listing.username now holds the correct value
      db.run(
        'UPDATE users SET current_task_id = ? WHERE id = ?',
        [taskId, userId],
        function(updErr) {
          if (updErr) return res.status(500).json({ error: updErr.message });
          if (this.changes === 0)
            return res.status(404).json({ error: 'User not found' });

          // send it back exactly as "username"
          res.json({
            message: 'Task accepted successfully',
            username: listing.username
          });
        }
      );
    }
  );
});



app.post('/api/completeTask', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // 1) Find current_task_id
  db.get(
    'SELECT current_task_id FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'User not found' });

      const taskId = row.current_task_id;
      if (!taskId) {
        return res
          .status(400)
          .json({ error: 'User has no active task to complete' });
      }

      // 2) Delete the listing
      db.run(
        'DELETE FROM listings WHERE id = ?',
        [taskId],
        function (delErr) {
          if (delErr) {
            console.error('Error deleting listing:', delErr.message);
            return res.status(500).json({ error: delErr.message });
          }

          console.log(`Deleted ${this.changes} listing(s) with id ${taskId}`);

          // 3) Clear the user's current_task_id
          db.run(
            'UPDATE users SET current_task_id = NULL WHERE id = ?',
            [userId],
            function (updErr) {
              if (updErr) {
                console.error('Error clearing user task:', updErr.message);
                return res.status(500).json({ error: updErr.message });
              }

              console.log(`Cleared task for user ${userId} (rows updated: ${this.changes})`);
              return res.json({
                message: 'Task completed: listing removed and user cleared',
              });
            }
          );
        }
      );
    }
  );
});




// Get a single listing by ID
app.get('/api/listings/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM listings WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('DB error fetching listing:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(row);
  });
});



// Server configuration
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));