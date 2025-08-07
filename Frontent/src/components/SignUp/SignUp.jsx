import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../SignIn/Form.css';

import email_icon from '../assets/email.png';
import user_icon from '../assets/user.png';
import padlock_icon from '../assets/padlock.png';
import phone_icon from '../assets/phone.png';
import gender_icon from '../assets/genders.png';

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [serverMessage, setServerMessage] = useState(''); // For server-side messages
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Invalid email format';
        break;
      case 'password':
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(value)) error = 'Password must be at least 6 characters and contain letters and numbers';
        break;
      case 'phone':
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value)) error = 'Phone number must be 10 digits';
        break;
      case 'gender':
        if (!value) error = 'Please select a gender';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
    setServerMessage(''); // Clear server message on change
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async () => {
    const errors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) errors[key] = error;
    });

    setFormErrors(errors);
    setTouchedFields(
      Object.keys(form).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    if (Object.keys(errors).length > 0) {
      setServerMessage('Please fix form errors before submitting.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setServerMessage(data.message); // Display server message

      if (data.success) {
        navigate('/'); // Redirect to login page after successful signup
      }
    } catch (err) {
      console.error("Sign-up fetch error:", err);
      setServerMessage('Sign-up failed: Server error. Please try again.');
    }
  };

  const renderError = (field) =>
    touchedFields[field] && formErrors[field] ? (
      <p className="error-text">{formErrors[field]}</p>
    ) : null;

  return (
    <div className="container">
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={user_icon} alt="user" />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        {renderError('name')}

        <div className="input">
          <img src={email_icon} alt="email" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        {renderError('email')}

        <div className="input">
          <img src={padlock_icon} alt="password" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        {renderError('password')}

        <div className="input">
          <img src={phone_icon} alt="phone" />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        {renderError('phone')}

        <div className="input">
          <img src={gender_icon} alt="gender" />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        {renderError('gender')}
      </div>

      {serverMessage && (
        <p style={{ color: serverMessage.includes('successful') ? 'green' : 'crimson', marginTop: '10px', textAlign: 'center' }}>
          {serverMessage}
        </p>
      )}

      <div className="submit-container">
        <div className="submit" onClick={handleSubmit}>Sign Up</div>
      </div>
    </div>
  );
};

export default SignUp;