import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './HomePageStyles.css';

const HomePage = () => {
  const [savedAnswers, setSavedAnswers] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Load saved answers from localStorage
    const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');
    const answers = Object.entries(gameData).map(([gameId, data]) => ({
      gameId,
      answer: data.answer,
      timestamp: new Date(data.timestamp).toLocaleString()
    }));
    setSavedAnswers(answers);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

    <div className="home-container">
      <div className="home-content">
        <div className="app-title-container">
          <h1 className="app-title">Daily Prompt</h1>
          <p className="app-subtitle">Connect with friends through daily challenges</p>
        </div>
        
        <div className="home-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Game Modes</h2>
            </div>
            <div className="card-content">
              <p className="card-description">
                Experience different phases of the game:
              </p>
              
              <div className="button-group">
                <Link 
                  to="/game/answer" 
                  className="action-button blue-button"
                >
                  Answer Today's Prompt
                </Link>
                <Link 
                  to="/game/guess" 
                  className="action-button purple-button"
                >
                  Guess Who Said What
                </Link>
                <Link 
                  to="/game/results" 
                  className="action-button green-button"
                >
                  View Results
                </Link>
                <Link 
                  to="/leaderboard" 
                  className="action-button yellow-button"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
          
          {savedAnswers.length > 0 ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Your Answers</h2>
              </div>
              <div className="card-content">
                <div className="answers-list">
                  {savedAnswers.map((item, index) => (
                    <div key={index} className="answer-item">
                      <div className="answer-header">
                        <span className="game-id">Game: {item.gameId}</span>
                        <span className="answer-timestamp">{item.timestamp}</span>
                      </div>
                      <p className="answer-text">"{item.answer}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Get Started</h2>
              </div>
              <div className="card-content">
                <p className="card-description">
                  You haven't submitted any answers yet. Start by answering today's prompt!
                </p>
                <div className="centered-button">
                  <Link 
                    to="/game/answer" 
                    className="action-button primary-button"
                  >
                    Start Now
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default HomePage;