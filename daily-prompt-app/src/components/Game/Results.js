import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsStyles.css';

const Results = ({ game = {}, answers = [], results = null, hasGuessedToday = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="results-container">
        <div className="results-card">
          <div className="results-header">
            <h2 className="header-title">Loading Results...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle empty state
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
            <h3 className="section-subheading">Prompt:</h3>
            <p className="prompt-text">{game || "What was the prompt?"}</p>
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
                  <p className="points-earned">
                    +{results.correctGuesses * 10} points from correct guesses
                    {results.perfectScore && (
                      <span className="bonus-points"> + 5 bonus points for perfect score!</span>
                    )}
                  </p>
                  <p className="total-points">
                    Total: +{results.pointsEarned || 0} points earned
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasGuessedToday ? (
            <div>  
              <h3 className="answers-heading">All Answers:</h3>
              
              <div className="answers-container">
                {Array.isArray(answers) && answers.map((answer, index) => {
                  // Consistently get answer content from the content or answer property
                  const content = answer.content || answer.answer || "No answer provided";
                  
                  // Get username, with guessedUsername showing what the user guessed
                  const username = answer.username || `User ${index + 1}`;
                  const wasGuessedCorrectly = answer.guessedUsername === username;
                  
                  // Get first letter for avatar
                  const initial = (username.charAt(0) || '?').toUpperCase();
                  
                  // Simple color selection based on username
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
                          <p className="answer-username">
                            {username}
                            {answer.guessedUsername && (
                              <span className={`guess-result ${wasGuessedCorrectly ? 'correct-guess' : 'incorrect-guess'}`}>
                                {wasGuessedCorrectly ? '(+10 points)' : ` (Your guess: ${answer.guessedUsername})`}
                              </span>
                            )}
                          </p>
                          <p className="answer-text">"{content}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(!Array.isArray(answers) || answers.length === 0) && (
                  <div className="empty-answers">
                    <p>No answers available for this game.</p>
                  </div>
                )}
              </div>
              
              {results && results.perfectScore && (
                <div className="perfect-score-banner">
                  <p>Perfect Score! +5 bonus points</p>
                </div>
              )}
            </div>
          ) : (
            <div style = {{marginTop:'10px', marginBottom:'10px' }} className="answers-hidden-message">
              <p>Submit your guesses to see all answers and reveal your score!</p>
              <button 
                onClick={() => navigate('/game/guess')}
                className="action-button blue-button"
              >
                Make Your Guesses
              </button>
            </div>
          )}
          
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