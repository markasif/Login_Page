import '../SignIn/Form.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import email_icon from '../assets/email.png';
import padlock from '../assets/padlock.png';
import phone_icon from '../assets/phone.png'; // Make sure you have this asset or similar

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: '', phone: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false); // New state to control UI flow
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setSuccess('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone); // Simple 10-digit validation
  const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);

  const handleVerify = async () => {
    const { email, phone } = form;

    if (!email || !phone) {
      return setMessage('Please enter your email and phone number.');
    }

    if (!validateEmail(email)) {
      return setMessage('Please enter a valid email.');
    }

    if (!validatePhone(phone)) {
      return setMessage('Please enter a valid 10-digit phone number.');
    }

    try {
      const res = await fetch('http://localhost:8000/verify-user', { // Call the new verify endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }), // Send email and phone for verification
      });

      const data = await res.json();
      if (data.found) {
        setSuccess('User verified! You can now set a new password.');
        setShowPasswordUpdate(true); // Show the new password input
        setMessage(''); // Clear any previous error messages
      } else {
        setMessage(data.message || 'User not found or details do not match.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setMessage('Server error during verification. Please try again later.');
    }
  };

  const handlePasswordUpdate = async () => {
    const { email, newPassword } = form;

    if (!newPassword) {
      return setMessage('Please enter your new password.');
    }

    if (!validatePassword(newPassword)) {
      return setMessage('Password must be at least 6 characters with letters and numbers.');
    }

    try {
      const res = await fetch('http://localhost:8000/reset-password', { // Call the new reset password endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }), // Send email and newPassword
      });

      const data = await res.json();
      if (data.success) { // Check for 'success' from the reset-password endpoint
        setSuccess('Password updated successfully. Redirecting to login...');
        setTimeout(() => navigate('/'), 2000); // Redirect to login after successful update
      } else {
        setMessage(data.message || 'Something went wrong during password update.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setMessage('Server error during password update. Please try again later.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Reset Password</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="email" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            disabled={showPasswordUpdate} // Disable email input after verification
          />
        </div>
        <div className="input">
          <img src={phone_icon} alt="phone" />
          <input
            type="tel" // Use tel for phone numbers
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            value={form.phone}
            disabled={showPasswordUpdate} // Disable phone input after verification
          />
        </div>

        {showPasswordUpdate && ( // Conditionally render new password input
          <div className="input">
            <img src={padlock} alt="new password" />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              onChange={handleChange}
              value={form.newPassword}
            />
          </div>
        )}
      </div>
      {message && <p style={{ color: 'crimson', marginTop: '10px' }}>{message}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      <div className="submit-container">
        {!showPasswordUpdate ? ( // Show verify button initially
          <div className="submit" onClick={handleVerify}>Verify Account</div>
        ) : ( // Show update button after verification
          <div className="submit" onClick={handlePasswordUpdate}>Update Password</div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;