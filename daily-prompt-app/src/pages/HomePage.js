import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePageStyles.css'; // Import our custom CSS

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Daily Prompt</h1>
          <p className="text-gray-600">Connect with friends through daily challenges</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Game Modes</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Experience different phases of the game:
              </p>
              
              <div className="space-y-3">
                <Link 
                  to="/game/answer" 
                  className="block p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-center font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300"
                >
                  Answer Today's Prompt
                </Link>
                <Link 
                  to="/game/guess" 
                  className="block p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-center font-medium shadow-md hover:from-purple-600 hover:to-purple-700 transition duration-300"
                >
                  Guess Who Said What
                </Link>
                <Link 
                  to="/game/results" 
                  className="block p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-center font-medium shadow-md hover:from-green-600 hover:to-green-700 transition duration-300"
                >
                  View Results
                </Link>
                <Link 
                  to="/leaderboard" 
                  className="block p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-center font-medium shadow-md hover:from-yellow-600 hover:to-yellow-700 transition duration-300"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
          
          {savedAnswers.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Your Answers</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {savedAnswers.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-indigo-700">Game: {item.gameId}</span>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                      <p className="italic text-gray-700">"{item.answer}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Get Started</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  You haven't submitted any answers yet. Start by answering today's prompt!
                </p>
                <div className="flex justify-center">
                  <Link 
                    to="/game/answer" 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition duration-300"
                  >
                    Start Now
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-10 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-indigo-800 mb-4">How to Play</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-4xl font-bold mb-2">1</div>
              <h3 className="font-bold text-gray-800 mb-2">Answer Prompts</h3>
              <p className="text-gray-600">Respond to the daily question within the time limit</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-4xl font-bold mb-2">2</div>
              <h3 className="font-bold text-gray-800 mb-2">Guess Answers</h3>
              <p className="text-gray-600">Try to match each anonymous answer to the right friend</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-4xl font-bold mb-2">3</div>
              <h3 className="font-bold text-gray-800 mb-2">Earn Points</h3>
              <p className="text-gray-600">Score points for correct guesses and climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;