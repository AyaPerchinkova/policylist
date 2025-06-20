import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './listSlice'; // Adjust the import based on your actual file structure
import './LoginPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    try {
      const { username: loggedInUsername, email } = await loginUser(username, password);
   // Fallback if email is undefined
      const userEmail = email || "Email not provided";
      // Store user data in localStorage (already done in loginUser, but for clarity)
      localStorage.setItem("username", loggedInUsername);
      localStorage.setItem("email", email);
  
     // console.log("Token received:", token);
    localStorage.setItem("username", username); // Store the username in localStorage
      console.log("Login successful for:", username); // Log the successful login
      navigate("/"); // Redirect to HomePage after successful login
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
<div className="login-page">
  <div className="login-container">
    {/* Login Box */}
    <div className="login-box">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </div>

    {/* Info Box */}
    <div className="info-box">
      <h2>Welcome Back!</h2>
      <p>Log in to access your account and explore amazing features.</p>
    </div>
  </div>
</div>
  );
};

export default LoginPage;