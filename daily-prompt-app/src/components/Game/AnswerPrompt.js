import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnswerPrompt = ({ prompt, onAnswerSubmit, timeRemaining }) => {
  const [answer, setAnswer] = useState('');
  
const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswerSubmit(answer);
    }
  };
  
  return (
    <div className="game-card">
      <div className="game-card-header">
        <h2 className="game-card-title">Today's Prompt</h2>
      </div>
      <div className="game-card-content">
        <p className="prompt-text">{prompt}</p>
               
        <form onSubmit={handleSubmit}>
          <textarea
            className="answer-input"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
          />
          
          <button
            style={{ marginBottom: '10px' }}
            type="submit" 
            className="submit-button"
            disabled={!answer.trim()}
          >
            Submit Answer
          </button>
                 
          
          <button
            onClick={() => navigate('/home')}
            className='action-button blue-button'
            >
            Back to Home
            </button>
        </form>
      </div>
    </div>
  );
};

export default AnswerPrompt;