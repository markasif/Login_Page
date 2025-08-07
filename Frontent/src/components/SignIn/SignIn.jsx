import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Form.css';
import email_icon from '../assets/email.png';
import padlock from '../assets/padlock.png';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        navigate('/home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleLogin}>
        <div className="inputs">
          <div className="input">
            <img src={email_icon} alt="email" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <img src={padlock} alt="password" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="forget-password">
          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </div>

        <div className="submit-container">
          <button type="submit" className="submit">Login</button>
          <button type="button" className="submit">
            <Link to="/signup" className="submit-link">
              Sign Up
            </Link>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;