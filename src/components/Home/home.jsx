import React, { useEffect, useState } from 'react';
import '../SignIn/Form.css';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then(res => {
        if (!res.ok) { // Check for HTTP errors
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Invalid users format:', data);
          setErrorMessage('Failed to load user data: Invalid format received.');
          setUsers([]);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setErrorMessage('Failed to load registered users. Please try again later.');
        setUsers([]);
      });
  }, []);

  return (
    <div className="container-home">
      <div className="header">
        <div className="text">Welcome Home</div>
        <div className="underline"></div>
      </div>

      <div className="home-content">
        <p className="home-message">You’ve successfully landed on the home page.</p>
      </div>

      {errorMessage && <p style={{ color: 'crimson', textAlign: 'center', marginTop: '20px' }}>{errorMessage}</p>}

      <div style={{ marginTop: '40px', overflowX: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>Registered Users</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#4caf50', color: 'white' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Gender</th>
            </tr>
          </thead>
          <tbody>
            {/* Display a message if no users */}
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                  <td style={tdStyle}>{user.name}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{user.phone}</td>
                  <td style={tdStyle}>{user.gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ ...tdStyle, textAlign: 'center' }}>No registered users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '12px', border: '1px solid #ddd', textAlign: 'left' };
const tdStyle = { padding: '12px', border: '1px solid #ddd' };

export default Home;