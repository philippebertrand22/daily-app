import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyQuestion } from '../components/Game/questionFetcher';
import AnswerPrompt from '../components/Game/AnswerPrompt';
import GuessAnswers from '../components/Game/GuessAnswers';
import Results from '../components/Game/Results';
import './GamePageStyles.css'; // Import the new CSS file
import { collection, doc, getDocs, where, query } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import based on your project structure

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('loading');
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  
  useEffect(() => {
    // Reset state when game ID changes
    setAnswers([]);
    setResults(null);
    setError(null);
    
    const fetchGroupMembers = async () => {
      try {
        const dailyQuestion = await getDailyQuestion();
        //console.log('Daily question:', dailyQuestion);
        
        const answersCollectionRef = collection(db, 'answers');
        
        const q = query(answersCollectionRef, where('question', '==', dailyQuestion));
        const querySnapshot = await getDocs(q);
        //console.log('Answers:', querySnapshot);

        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          answer: doc.data().answer
        }));
        //console.log('Results:', results);

        // If results exist, update members list dynamically
        let members = results.length > 0 
          ? results.map(doc => ({
              id: doc.id,
              name: doc.username // Assuming username represents the member's name
            }))
          : [
              { id: '1', name: 'Alex' },
              { id: '2', name: 'Taylor' },
              { id: '3', name: 'Jordan' },
              { id: '4', name: 'Riley' },
            ];

        setGroupMembers(members);
      } catch (err) {
        console.log('Error fetching group members:', err);
      }
    };

    // Fetch daily question
    async function loadDailyQuestion() {
      try {
        const dailyQuestion = await getDailyQuestion();
        setPrompt(dailyQuestion);
        
        // Simulate loading states based on gameId
        if (gameId === 'answer') {
          setGameState('answer');
        } else if (gameId === 'guess') {
          setGameState('guess');
          // Set mock answers for the guessing phase
          setAnswers([
            { id: 'a1', content: 'A witty response about cheese.' },
            { id: 'a2', content: 'Another creative answer.' },
            { id: 'a3', content: 'A humorous take on the question.' },
            { id: 'a4', content: 'An unexpected twist of an answer.' },
          ]);
        } else if (gameId === 'results') {
          setGameState('results');
          // Set mock answers for the results phase
          setAnswers([
            { id: 'a1', content: 'A witty response about cheese.', user: { username: 'Alex' } },
            { id: 'a2', content: 'Another creative answer.', user: { username: 'Taylor' } },
            { id: 'a3', content: 'A humorous take on the question.', user: { username: 'Jordan' } },
            { id: 'a4', content: 'An unexpected twist of an answer.', user: { username: 'Riley' } },
          ]);
          // Set mock results
          setResults({
            correctGuesses: 2,
            pointsEarned: 20
          });
        } else {
          // Default to answer phase
          setGameState('answer');
        }
      } catch (err) {
        console.error("Error loading daily question:", err);
        setError("Failed to load game data");
      }
    }
    
    fetchGroupMembers();
    loadDailyQuestion();
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
      navigate('/home');
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