import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

import './AuthPagesStyles.css';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!email) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      const user = userCredential.user;

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        profile: {
          emailVerified: false,
          registrationType: 'email'
        }
      });

      // Navigate to home after successful registration
      navigate('/home');
    } catch (error) {
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Email is already registered. Please use a different email or try logging in.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Create a password"
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Confirm your password"
              minLength="6"
            />
          </div>
          
          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>
        </form>
        
        <p className="secondary-text">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="link-text"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;