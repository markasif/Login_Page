const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('fast-csv');

const app = express();
const PORT = 8000;
const CSV_FILE = 'users.csv';

app.use(cors());
app.use(express.json());

// Initialize CSV with headers if not present
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'name,email,phone,password,gender\n');
}

// ✅ Updated readUsers function — trims whitespace
const readUsers = () => {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv.parse({ headers: true }))
      .on('data', row => {
        Object.keys(row).forEach(key => {
          row[key] = row[key].trim(); // 🧼 Trim each field
        });
        users.push(row);
      })
      .on('end', () => resolve(users))
      .on('error', err => reject(err));
  });
};

// Helper function to write all users back to CSV (for updates)
const writeUsers = (users) => {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(CSV_FILE);
    csv.writeToStream(ws, users, { headers: true })
      .on('finish', resolve)
      .on('error', reject);
  });
};

// POST /signup
app.post('/signup', async (req, res) => {
  const { name, email, phone, password, gender } = req.body;
  if (!name || !email || !phone || !password || !gender) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const users = await readUsers();
    const exists = users.find(user => user.email === email);
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const newUser = { name, email, phone, password, gender };

    // 🧠 Check if we need to add a newline before appending
    const stats = fs.statSync(CSV_FILE);
    const needsNewline = stats.size > 0;

    const ws = fs.createWriteStream(CSV_FILE, { flags: 'a' });

    if (needsNewline) {
      ws.write('\n'); // ensure proper separation between rows
    }

    csv.writeToStream(ws, [newUser], { headers: false })
      .on('finish', () => {
        res.status(201).json({ success: true, message: 'Signup successful! You can now log in.' });
      })
      .on('error', err => {
        console.error('CSV write error:', err);
        res.status(500).json({ message: 'Error writing to CSV' });
      });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Error signing up' });
  }
});


// POST /login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with:', email);

    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST /verify-user
app.post('/verify-user', async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ found: false, message: 'Email and phone are required for verification.' });
  }

  try {
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.phone === phone);
    if (user) {
      res.json({ found: true, message: 'User verified. You can now set a new password.' });
    } else {
      res.status(404).json({ found: false, message: 'User not found or details do not match.' });
    }
  } catch (err) {
    console.error('Verify user error:', err);
    res.status(500).json({ found: false, message: 'Server error during verification.' });
  }
});

// POST /reset-password
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }

  try {
    let users = await readUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      await writeUsers(users);
      res.json({ success: true, message: 'Password updated successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
});

// GET /users
app.get('/users', async (req, res) => {
  try {
    const users = await readUsers();
    const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Error reading users for Home page:', err);
    res.status(500).json({ message: 'Error reading users' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
