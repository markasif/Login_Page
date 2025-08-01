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

// Helper function to read all users
const readUsers = () => {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv.parse({ headers: true }))
      .on('data', row => users.push(row))
      .on('end', () => resolve(users))
      .on('error', err => reject(err));
  });
};

// Helper function to write all users back to CSV (used for updates)
const writeUsers = (users) => {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(CSV_FILE);
    csv.writeToStream(ws, users, { headers: true }) // Write with headers when rewriting all
      .on('finish', resolve)
      .on('error', reject);
  });
};

// Signup
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
    const ws = fs.createWriteStream(CSV_FILE, { flags: 'a' });
    csv.writeToStream(ws, [newUser], { headers: false });
    res.status(201).json({ success: true, message: 'Signup successful! You can now log in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Error signing up' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login error' });
  }
});

// New Endpoint: Verify user for password reset (checks email and phone)
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

// New Endpoint: Reset Password (updates the password)
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }

  try {
    let users = await readUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
      // Important: In a real app, hash newPassword before saving!
      users[userIndex].password = newPassword; // Update the password
      await writeUsers(users); // Write all users back to the CSV

      res.json({ success: true, message: 'Password updated successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
});


// All Registered Users (used by Home.jsx)
app.get('/users', async (req, res) => {
  try {
    const users = await readUsers();
    // It's still good practice not to send passwords to the client, even in basic setups.
    const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Error reading users for Home page:', err);
    res.status(500).json({ message: 'Error reading users' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});