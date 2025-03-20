import React, { useState } from 'react';

const GuessAnswers = ({ answers = [], groupMembers = [], onSubmitGuesses }) => {
  const [guesses, setGuesses] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const getCompletionPercentage = () => {
    if (!answers || answers.length === 0) return 0;
    return (Object.keys(guesses).length / answers.length) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Who Said What?</h2>
        <p className="text-white/80">
          Match each answer to the friend you think wrote it
        </p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Completion: {Math.round(getCompletionPercentage())}%</span>
            <span className="text-sm text-gray-500">{Object.keys(guesses).length}/{answers.length} matched</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {answers && answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div 
                  key={index} 
                  className={`bg-white border rounded-xl p-5 shadow-sm transition duration-300 ${
                    guesses[answer.id] ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                      Answer #{index + 1}
                    </span>
                    <p className="text-gray-800 font-medium">"{answer.content || 'No content provided'}"</p>
                  </div>
                  
                  <div className="mt-3">
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
              type="submit"
              disabled={submitting || Object.keys(guesses).length !== answers.length}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ${
                Object.keys(guesses).length === answers.length 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Guesses'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default GuessAnswers;