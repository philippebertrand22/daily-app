import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/GamePageStyles.css';

const GuessAnswers = ({ answers = [], groupMembers = [], onSubmitGuesses, question = "Yesterday's Question" }) => {
  const [guesses, setGuesses] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelectUser = (answerId, userId) => {
    setGuesses(prevGuesses => ({
      ...prevGuesses,
      [answerId]: userId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answers.length) {
      setError('No answers available to guess');
      return;
    }

    if (Object.values(guesses).includes('') || Object.keys(guesses).length !== answers.length) {
      setError('Please match all answers to users');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Pass the complete guesses object to the parent component
      await onSubmitGuesses(guesses);
    } catch (err) {
      console.error('Failed to submit guesses:', err);
      setError('Failed to submit guesses');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="game-card">
      <div className="game-card-header">
        <h2 className="game-card-title">Who Said What?</h2>
        <h4 style={{ color: "white" }}>Match each answer to the friend you think wrote it</h4>
      </div>
      <div className="game-card-content">
        <div>
          <span id="question" style={{ marginLeft: '15px', fontWeight: 'bold' }} className="question-title">
            {question}
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          {answers.length > 0 ? (
            <div style={{ marginTop: '10px' }}>
              {answers.map((answer, index) => (
                <div 
                  key={answer.id || index} 
                  className={`bg-white border rounded-xl p-5 shadow-sm transition duration-300 ${
                    guesses[answer.id] ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="mb-4">
                    <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>
                      Answer #{index + 1}
                    </span>
                    <p style={{ marginLeft: '15px' }}>"{answer.content || 'No content provided'}"</p>
                  </div>
                  
                  <div style={{ marginLeft: '15px' }}>
                    <label style={{ marginRight: '15px' }}>Who do you think said this?</label>
                    <select
                      className={`w-full p-3 border rounded-lg transition duration-200 ${
                        guesses[answer.id] 
                          ? 'border-purple-300 focus:ring-purple-500 focus:border-purple-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      value={guesses[answer.id] || ''}
                      onChange={(e) => handleSelectUser(answer.id, e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">-- Select a friend --</option>
                      {groupMembers.map((member) => (
                        <option 
                          key={member.id}
                          value={member.id}
                          // Disable option if already selected for another answer
                          disabled={
                            Object.entries(guesses).some(
                              ([key, value]) => value === member.id && key !== answer.id
                            )
                          }
                        >
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🤔</div>
              <p className="text-gray-600">No answers available to guess</p>
            </div>
          )}

          {error && <div className="error-message">⚠️ {error}</div>}

          {answers.length > 0 && (
            <button
              style={{ margin: '15px' }}
              type="submit"
              disabled={
                submitting || 
                Object.keys(guesses).length !== answers.length || 
                Object.values(guesses).includes('')
              }
              //onClick={() => navigate('/home')}
              className="submit-button"
            >
              {submitting ? 'Submitting...' : 'Submit Guesses'}
            </button>
          )}

          <button
            style={{ marginLeft: '15px' }}
            onClick={() => navigate('/home')}
            className="action-button blue-button"
            type="button"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuessAnswers;