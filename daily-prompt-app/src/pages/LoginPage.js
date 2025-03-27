import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';

import './AuthPagesStyles.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      setError('Google sign-in failed');
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailLogin}>
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
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-group">
            <Link 
              to="/forgot-password" 
              className="link-text"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className="auth-button"
          >
            Sign In
          </button>
        </form>
        
        <div className="divider">
          <span>Or continue with</span>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          className="google-button"
        >
          <svg className="google-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.426-3.388-7.426-7.574s3.331-7.574 7.426-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.99H12.24z" />
          </svg>
          Sign in with Google
        </button>
        
        <p className="secondary-text">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="link-text"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;