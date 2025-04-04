import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsStyles.css'; // Import custom CSS

const Results = ({ game = {}, answers = [], results = null }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verify answers data when component mounts or answers change
  useEffect(() => {
    if (answers && answers.length > 0) {
      console.log('Answers data:', answers);
    }
    setIsLoading(false);
  }, [answers]);
  
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
  
  // Helper function to safely extract username from answer object
  const getUsernameFromAnswer = (answer, index) => {
    if (!answer) return `User ${index + 1}`;
    
    // Case 1: User is a string (username directly)
    if (typeof answer.user === 'string') {
      return answer.user;
    }
    
    // Case 2: User is an object with username property
    if (answer.user && typeof answer.user === 'object' && answer.user.username) {
      return answer.user.username;
    }
    
    // Case 3: Answer has username property directly
    if (answer.username) {
      return answer.username;
    }
    
    // Default fallback
    return `User ${index + 1}`;
  };
  
  // Helper function to safely extract content from answer object
  const getContentFromAnswer = (answer) => {
    if (!answer) return "No answer provided";
    
    // Case 1: Content is directly on the answer object
    if (typeof answer.content === 'string') {
      return answer.content;
    }
    
    // Case 2: Answer has text property instead
    if (typeof answer.text === 'string') {
      return answer.text;
    }
    
    // Case 3: Answer has answer property 
    if (typeof answer.answer === 'string') {
      return answer.answer;
    }
    
    // Default fallback
    return "No answer provided";
  };
  
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
            {Array.isArray(answers) && answers.map((answer, index) => {
              const username = getUsernameFromAnswer(answer, index);
              const content = getContentFromAnswer(answer);
              const initial = (username?.charAt(0) || '?').toUpperCase();
              
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