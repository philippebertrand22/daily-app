import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsStyles.css'; // Import custom CSS

const Results = ({ game = {}, answers = [], results = null }) => {
  const navigate = useNavigate();
  
  if (!game || !answers || answers.length === 0) {
    return (
      <div className="results-container">
        <div className="results-card">
          <div className="results-header">
            <h2 className="header-title">Results</h2>
          </div>
          <div className="empty-content">
            <p className="empty-message">No results to display</p>
              <div className="button-container">
              <button 
                onClick={() => navigate('/home')}
                className="action-button blue-button"
              >
                Back to Home
              </button>
              
              <button 
                onClick={() => navigate('/leaderboard')}
                className="action-button purple-button"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h2 className="header-title">Results Revealed!</h2>
          <p className="header-subtitle">See who said what and how you scored</p>
        </div>
        
        <div className="results-content">
          <div className="prompt-card">
            <h3 className="section-subheading">Today's Prompt:</h3>
            <p className="prompt-text">{game.prompt || "What was the prompt?"}</p>
          </div>
          
          {results && (
            <div className="score-card">
              <h3 className="section-subheading">Your Score:</h3>
              <div className="score-display">
                <div className="score-number">
                  {results.correctGuesses || 0}/{answers.length}
                </div>
                <div className="score-details">
                  <p className="score-label">Correct guesses</p>
                  <p className="points-earned">+{results.pointsEarned || 0} points earned</p>
                </div>
              </div>
            </div>
          )}
          
          <h3 className="answers-heading">All Answers:</h3>
          
          <div className="answers-container">
            {answers.map((answer, index) => {
              const username = answer.user?.username || `User ${index + 1}`;
              const initial = username.charAt(0).toUpperCase();
              
              // Generate a consistent color based on the username
              const colors = ['blue-avatar', 'purple-avatar', 'pink-avatar', 'yellow-avatar', 'green-avatar', 'indigo-avatar'];
              const colorIndex = username.charCodeAt(0) % colors.length;
              const avatarClass = colors[colorIndex];
              
              return (
                <div key={index} className="answer-card">
                  <div className="answer-content">
                    <div className={`avatar ${avatarClass}`}>
                      {initial}
                    </div>
                    
                    <div className="answer-details">
                      <p className="answer-username">{username}</p>
                      <p className="answer-text">"{answer.content || "No answer provided"}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="button-container">
            <button 
              onClick={() => navigate('/home')}
              className="action-button blue-button"
            >
              Back to Home
            </button>
            
            <button 
              onClick={() => navigate('/leaderboard')}
              className="action-button purple-button"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;