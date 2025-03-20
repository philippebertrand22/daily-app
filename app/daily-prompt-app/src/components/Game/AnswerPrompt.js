// Enhanced AnswerPrompt component
import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react'; // If you have lucide-react installed

const AnswerPrompt = ({ prompt, onAnswerSubmit, timeRemaining }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer) {
      setError('Please provide an answer');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // This will be replaced with your actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      onAnswerSubmit(answer);
    } catch (error) {
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Today's Prompt</h2>
        <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full">
          <Clock className="text-white mr-2" size={20} />
          <span className="font-mono text-white font-medium">{formatTime(timeRemaining)}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-blue-50 p-5 rounded-xl mb-6 border-l-4 border-blue-500">
          <p className="text-lg text-gray-800">{prompt || "What's your favorite type of cheese?"}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Your Answer:</label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Type your thoughts here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              disabled={submitting}
            ></textarea>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ${
              submitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
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
            ) : 'Submit Answer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnswerPrompt;