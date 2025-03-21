import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePageStyles.css'; // Updated import to match your CSS filename

const HomePage = () => {
  const [savedAnswers, setSavedAnswers] = useState([]);

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

  return (
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
        
        <div className="how-to-play-container">
          <h2 className="section-title">How to Play</h2>
          <div className="steps-container">
            <div className="step-card blue-step">
              <div className="step-number">1</div>
              <h3 className="step-title">Answer Prompts</h3>
              <p className="step-description">Respond to the daily question within the time limit</p>
            </div>
            <div className="step-card purple-step">
              <div className="step-number">2</div>
              <h3 className="step-title">Guess Answers</h3>
              <p className="step-description">Try to match each anonymous answer to the right friend</p>
            </div>
            <div className="step-card green-step">
              <div className="step-number">3</div>
              <h3 className="step-title">Earn Points</h3>
              <p className="step-description">Score points for correct guesses and climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;