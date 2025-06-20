import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './listSlice'; // Adjust the import based on your actual file structure
import './RegisterPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success messages

    if (!email) {
      setError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
    // Call the registerUser function and pass the required fields
    const response = await registerUser(username, password, confirmPassword, email);

    // Assuming the backend returns the registered user data
    const { username: registeredUsername, email: registeredEmail } = response;

    // Store the username and email in localStorage
    localStorage.setItem('username', registeredUsername);
    localStorage.setItem('email', registeredEmail);
     console.log("Registration successful for:", username); // Log the successful registration
     setSuccess('Registration successful! Redirecting to home...');
     setTimeout(() => navigate('/'), 2000); // Redirect to HomePage after 2 seconds
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };
  return (
    <div className="register-page">
        <div className="register-container">

      <div className="register-box">
      <div className="register-form">
      <h2>{t("register.title")}</h2>
      {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
          <label htmlFor="username">{t("register.username")}</label>
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              placeholder={t("register.username")}
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          </div>
          <div className="form-group">
          <label htmlFor="email">{t("register.email")}</label>
          <div className="input-with-icon">
          <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          <input
            type="email"
            placeholder={t("register.EnterEmail")}
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-email"
            required
          />
        </div>
        </div>
        <div className="form-group">
        <label htmlFor="password">{t("register.password")}</label>
        <div className="input-with-icon">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder={t("register.EnterPassword")}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
        <label htmlFor="confirmPassword">{t("register.confirmPassword")}</label>
        <div className="input-with-icon">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Confirm your password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="register-button">{t("register.registerButton")}</button>
        </form>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
    <div className="info-box">
    <h2>{t("register.welcomeTitle")}</h2>
    <p>{t("register.welcomeMessage")}</p>
    </div>
    </div>
    </div>
  );
};

export default RegisterPage;