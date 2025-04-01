import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuessAnswers = ({ answers = [], groupMembers = [], onSubmitGuesses }) => {
  const [guesses, setGuesses] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelectUser = (answerId, userId) => {
    setGuesses({
      ...guesses,
      [answerId]: userId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answers || answers.length === 0) {
      setError('No answers available to guess');
      return;
    }
    
    if (Object.keys(guesses).length !== answers.length) {
      setError('Please match all answers to users');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmitGuesses(guesses);
    } catch (error) {
      setError('Failed to submit guesses');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="game-card">
      <div className="game-card-header">
      <h2 className="game-card-title">Who Said What?</h2>
      <h4 className="game-card-subtitle">Match each answer to the friend you think wrote it</h4>
    </div>
      <div className="game-card-content">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">          
          <div className="p-6">           
            <form onSubmit={handleSubmit}>
              {answers && answers.length > 0 ? (
                <div style = {{marginTop:'10px'}} className="space-y-6">
                  {answers.map((answer, index) => (
                    <div 
                      key={index} 
                      className={`bg-white border rounded-xl p-5 shadow-sm transition duration-300 ${
                        guesses[answer.id] ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="mb-4">
                        <span style = {{marginLeft:'15px'}} className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                          Answer #{index + 1}
                        </span>
                        <p style = {{marginLeft:'15px'}} className="text-gray-800 font-medium">"{answer.content || 'No content provided'}"</p>
                      </div>
                      
                      <div style = {{marginLeft:'15px'}} className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Who do you think said this?
                        </label>
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
                          {groupMembers && groupMembers.map((member, idx) => (
                            <option 
                              key={idx} 
                              value={member.id || idx}
                              // If this option is already selected for another answer, make it disabled
                              disabled={Object.values(guesses).includes(member.id || idx.toString()) && guesses[answer.id] !== (member.id || idx.toString())}
                            >
                              {member.name || `Friend ${idx + 1}`}
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
              
              {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {answers && answers.length > 0 && (
                <button
                  style = {{margin:'15px'}}
                  type="submit"
                  disabled={submitting || Object.keys(guesses).length !== answers.length}
                  className={"submit-button"}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      Submitting...
                    </span>
                  ) : 'Submit Guesses'}
                </button>
              )}
              <button
                style = {{marginLeft:'15px'}}
                onClick={() => navigate('/home')}
                className='action-button blue-button'
                >
                Back to Home
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessAnswers;