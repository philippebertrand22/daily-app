import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnswerPrompt from '../components/Game/AnswerPrompt';
import GuessAnswers from '../components/Game/GuessAnswers';
import Results from '../components/Game/Results';
import './GamePageStyles.css'; // Import the new CSS file

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('loading');
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Mock group members
  const groupMembers = [
    { id: '1', name: 'Alex' },
    { id: '2', name: 'Taylor' },
    { id: '3', name: 'Jordan' },
    { id: '4', name: 'Riley' },
  ];
  
  useEffect(() => {
    // Reset state when game ID changes
    setAnswers([]);
    setResults(null);
    setError(null);
    
    console.log(`Loading game with ID: ${gameId}`);
    
    // Simulate loading data
    setTimeout(() => {
      try {
        if (gameId === 'answer') {
          setPrompt("What's your favorite type of cheese?");
          setGameState('answer');
        } else if (gameId === 'guess') {
          setPrompt("What's your favorite type of cheese?");
          setGameState('guess');
          // Set mock answers for the guessing phase
          setAnswers([
            { id: 'a1', content: 'Cheddar, because it reminds me of home.' },
            { id: 'a2', content: 'Brie, it\'s fancy but approachable.' },
            { id: 'a3', content: 'Gouda, because it\'s good-a!' },
            { id: 'a4', content: 'Blue cheese, the stronger the better.' },
          ]);
        } else if (gameId === 'results') {
          setPrompt("What's your favorite type of cheese?");
          setGameState('results');
          // Set mock answers for the results phase
          setAnswers([
            { id: 'a1', content: 'Cheddar, because it reminds me of home.', user: { username: 'Alex' } },
            { id: 'a2', content: 'Brie, it\'s fancy but approachable.', user: { username: 'Taylor' } },
            { id: 'a3', content: 'Gouda, because it\'s good-a!', user: { username: 'Jordan' } },
            { id: 'a4', content: 'Blue cheese, the stronger the better.', user: { username: 'Riley' } },
          ]);
          // Set mock results
          setResults({
            correctGuesses: 2,
            pointsEarned: 20
          });
        } else {
          // For any other gameId, default to answer phase
          setPrompt("What's your favorite type of cheese?");
          setGameState('answer');
        }
      } catch (err) {
        console.error("Error setting up game:", err);
        setError("Failed to load game data");
      }
    }, 500);
  }, [gameId]);
  
  const handleAnswerSubmit = (answer) => {
    console.log('Answer submitted:', answer);
    
    // Save to localStorage for demo purposes
    try {
      const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');
      gameData[gameId] = {
        answer,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('gameData', JSON.stringify(gameData));
      
      // Show success message
      alert('Your answer has been submitted!');
      
      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Error saving answer:', err);
      alert('Failed to save your answer');
    }
  };
  
  const handleGuessesSubmit = (guesses) => {
    console.log('Guesses submitted:', guesses);
    
    try {
      // Save guesses to localStorage
      const guessData = JSON.parse(localStorage.getItem('guessData') || '{}');
      guessData[gameId] = {
        guesses,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('guessData', JSON.stringify(guessData));
      
      // Transition to results page for demo
      setGameState('results');
      
      // Add user information to answers
      const answersWithUsers = answers.map(answer => {
        // Randomly pick a correct user for demo
        const randomIndex = Math.floor(Math.random() * groupMembers.length);
        return {
          ...answer,
          user: { username: groupMembers[randomIndex].name }
        };
      });
      setAnswers(answersWithUsers);
      
      // Generate random results for demo
      const correctCount = Math.floor(Math.random() * (answers.length + 1));
      setResults({
        correctGuesses: correctCount,
        pointsEarned: correctCount * 10
      });
      
    } catch (err) {
      console.error('Error processing guesses:', err);
      setError('Failed to process your guesses');
    }
  };
  
  // Loading state
  if (gameState === 'loading') {
    return (
      <div className="container">
        <h1 className="page-title">Daily Prompt</h1>
        <div className="loading-container">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Daily Prompt</h1>
        <div className="error-container">
          <p className="error-title">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/home')}
            className="home-button"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1 className="page-title">Daily Prompt</h1>
      
      {gameState === 'answer' && (
        <AnswerPrompt 
          prompt={prompt}
          onAnswerSubmit={handleAnswerSubmit}
          timeRemaining={3600} // 1 hour in seconds
        />
      )}
      
      {gameState === 'guess' && (
        <GuessAnswers 
          answers={answers}
          groupMembers={groupMembers}
          onSubmitGuesses={handleGuessesSubmit}
        />
      )}
      
      {gameState === 'results' && (
        <Results 
          game={{ prompt }}
          answers={answers}
          results={results}
        />
      )}
    </div>
  );
};

export default GamePage;