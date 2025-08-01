import { Link, useNavigate } from 'react-router-dom';
import './Form.css';
import email_icon from '../assets/email.png';
import padlock from '../assets/padlock.png';
import { useState } from 'react';

const Login = () => {
  const [form,setForm] = useState({email:'',password:''});
  const navigate = useNavigate();
  const handleChange = (e) => setForm({...form,[e.target.name]:e.target.value});
  const handleLogin = async () =>{
    const res = await fetch("http://localhost:8000/login",{
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if(data.success){
      navigate('/home');
    }else{
      alert(data.message)
    }
  };
  return (
    <div className='container'>
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="email" />
          <input type="email" name='email' placeholder="Email" onChange={handleChange} />
        </div>
        <div className="input">
          <img src={padlock} alt="password" />
          <input type="password" name='password' placeholder="Password" onChange={handleChange} />
        </div>
      </div>

      <div className="forget-password">
        <Link to="/forgot-password" style={{ textDecoration: 'none', color: 'blue' }}>
          Forgot Password?
        </Link>
      </div>


      <div className="submit-container">
        <div className="submit" onClick={handleLogin}>Login</div>
        <div className="submit">
          <Link to="/signup" style={{ textDecoration: 'none', color: 'white' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;