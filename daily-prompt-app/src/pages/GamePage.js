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

    // Function to fetch daily question and answers
    const queryForAnswers = async () => {
      try {
        const dailyQuestion = await getDailyQuestion();
        
        if (!dailyQuestion) {
          console.warn("No daily question found.");
          return [];
        }
        
        const answersCollectionRef = collection(db, 'answers');
        const q = query(answersCollectionRef, where('question', '==', dailyQuestion));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          console.warn("No matching answers found for:", dailyQuestion);
          return [];
        }
    
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          answer: doc.data().answer
        }));
    
        return results;
    
      } catch (err) {
        console.error("Error executing Firestore query:", err);
        return [];
      }
    };

    // Function to fetch group members
    const fetchGroupMembers = async () => {
      try {
        // Await queryForAnswers here to ensure it's done before setting state
        const results = await queryForAnswers();
        //console.log("Fetched answers:", results);

        // If results exist, update members list dynamically
        let members = results.length > 0 
          ? results.map(doc => ({
              id: doc.id,
              name: doc.username
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

    // Fetch daily question and group members
    async function loadDailyQuestion() {
      try {
        const dailyQuestion = await getDailyQuestion();
        setPrompt(dailyQuestion);

        // Await queryForAnswers here to ensure it's done before setting state
        const results = await queryForAnswers();
        //console.log("Fetched answers:", results)
        
        // Simulate loading states based on gameId
        if (gameId === 'answer') {
          setGameState('answer');
        } else if (gameId === 'guess') {
          setGameState('guess');
          setAnswers(results.map(item => ({
            id: item.id,
            content: item.answer,
          })));
        } else if (gameId === 'results') {
          setGameState('results');
          setAnswers(results.map(item => ({
            id: item.id,
            content: item.answer,
            user: item.username
          })));
          setResults({
            correctGuesses: 2,
            pointsEarned: 20
          });
        } else {
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