import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyQuestion, getYesterdayQuestion } from '../components/Game/questionFetcher';
import AnswerPrompt from '../components/Game/AnswerPrompt';
import GuessAnswers from '../components/Game/GuessAnswers';
import Results from '../components/Game/Results';
import './GamePageStyles.css';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('loading');
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  
  // Fetch question and answers only once on component mount
  useEffect(() => {
    let isMounted = true;
    
    // Reset state when game ID changes
    setAnswers([]);
    setResults(null);
    setError(null);

    async function loadGameData() {
      try {
        // Fetch the daily question first - only once
        const dailyQuestion = await getDailyQuestion();
        if (!isMounted) return;

        const yesterdayQuestion = await getYesterdayQuestion();
        if (!isMounted) return;
        
        if (dailyQuestion) {
          setPrompt(dailyQuestion);
          
          // Fetch answers for this question
          const answersData = await fetchAnswersForQuestion(yesterdayQuestion);
          if (!isMounted) return;
          
          // Process answers based on game state
          processAnswers(answersData);
          
          // Set group members based on answers or defaults
          setGroupMembers(
            answersData.length > 0 
              ? answersData.map(doc => ({
                  id: doc.id,
                  name: doc.username
                }))
              : [
                  { id: '1', name: 'Alex' },
                  { id: '2', name: 'Taylor' },
                  { id: '3', name: 'Jordan' },
                  { id: '4', name: 'Riley' },
                ]
          );
        } else {
          setError("No yesterday question available");
        }
      } catch (err) {
        console.error("Error loading game data:", err);
        if (isMounted) {
          setError("Failed to load game data");
        }
      }
    }
    
    loadGameData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [gameId]);

  // Function to fetch answers for a specific question
  const fetchAnswersForQuestion = async (question) => {
    try {
      const answersCollectionRef = collection(db, 'answers');
      const q = query(answersCollectionRef, where('question', '==', question));
      const querySnapshot = await getDocs(q);
      //console.log("this is the question: " + question)
      
      if (querySnapshot.empty) {
        console.warn("No matching answers found for:", question);
        return [];
      }
  
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        answer: doc.data().answer
      }));
    } catch (err) {
      console.error("Error executing Firestore query:", err);
      return [];
    }
  };

  // Process answers based on game state
  const processAnswers = (answersData) => {
    if (gameId === 'answer') {
      setGameState('answer');
    } else if (gameId === 'guess') {
      setGameState('guess');
      setAnswers(answersData.map(item => ({
        id: item.id,
        content: item.answer,
      })));
    } else if (gameId === 'results') {
      setGameState('results');
      setAnswers(answersData.map(item => ({
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
  };
  
  const handleAnswerSubmit = (answer) => {
    //console.log('Answer submitted:', answer);
    
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
    //console.log('Guesses submitted:', guesses);
    
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