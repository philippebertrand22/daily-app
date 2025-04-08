import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyQuestion, getYesterdayQuestion } from '../components/Game/questionFetcher';
import AnswerPrompt from '../components/Game/AnswerPrompt';
import GuessAnswers from '../components/Game/GuessAnswers';
import Results from '../components/Game/Results';
import './GamePageStyles.css';
import { collection, getDocs, where, query, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('loading');
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [yesterdayPrompt, setYesterdayPrompt] = useState("");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [perfectScore, setPerfectScore] = useState(false);
  const [hasGuessedToday, setHasGuessedToday] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userScoreData, setUserScoreData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const uid = currentUser.uid;
      setUserId(uid);
    }

    setAnswers([]);
    setResults(null);
    setError(null);

    async function loadGameData() {
      try {
        const yesterdayQuestion = await getYesterdayQuestion();
        if (!isMounted) return;

        const dailyQuestion = await getDailyQuestion();
        if (!isMounted) return;

        if (dailyQuestion) {
          setDailyPrompt(dailyQuestion);
        }

        if (yesterdayQuestion) {
          setYesterdayPrompt(yesterdayQuestion);

          const answersData = await fetchAnswersForQuestion(yesterdayQuestion);
          if (!isMounted) return;

          if (answersData.length === 0) {
            setGroupMembers([
              { id: '1', name: 'Alex' },
              { id: '2', name: 'Taylor' },
              { id: '3', name: 'Jordan' },
              { id: '4', name: 'Riley' },
            ]);
          } else {
            const uniqueUsers = [...new Set(answersData.map(doc => doc.username))];
            setGroupMembers(uniqueUsers.map((username, index) => ({
              id: index.toString(),
              name: username
            })));
          }

          await checkGuessStatus(yesterdayQuestion);
          setGameStateAndFormatAnswers(gameId, answersData);
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

    const checkGuessStatus = async (questionId) => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
        
        if (userDoc.exists()) {
          // Check if user has guessed today
          if (userDoc.data().lastGuessDate === today) {
            setHasGuessedToday(true);
          } else {
            setHasGuessedToday(false);
          }
          
          // Check for saved score data for this question
          const scoresRef = collection(db, 'userScores');
          const q = query(
            scoresRef, 
            where('userId', '==', currentUser.uid),
            where('questionId', '==', questionId)
          );
          
          const scoreSnapshot = await getDocs(q);
          
          if (!scoreSnapshot.empty) {
            const scoreData = scoreSnapshot.docs[0].data();
            setResults({
              correctGuesses: scoreData.correctGuesses,
              pointsEarned: scoreData.pointsEarned,
              perfectScore: scoreData.perfectScore
            });
            setUserScoreData(scoreData);
          }
        } else {
          setHasGuessedToday(false);
        }
      } catch (err) {
        console.error("Error checking guess status:", err);
      }
    };

    loadGameData();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const fetchAnswersForQuestion = async (question) => {
    try {
      const answersCollectionRef = collection(db, 'answers');
      const q = query(answersCollectionRef, where('question', '==', question));
      const querySnapshot = await getDocs(q);

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

  const setGameStateAndFormatAnswers = (state, answersData) => {
    switch (state) {
      case 'answer':
        setGameState('answer');
        break;

      case 'guess':
        setGameState('guess');
        setAnswers(answersData.map(item => ({
          id: item.id,
          content: item.answer,
          username: item.username || 'Anonymous'
        })));
        break;

      case 'results':
        setGameState('results');
        const formattedAnswers = answersData.map(item => ({
          id: item.id,
          content: item.answer,
          username: item.username
        }));
        
        // If we have user score data, add guessed usernames to answers
        if (userScoreData && userScoreData.guesses) {
          formattedAnswers.forEach(answer => {
            const guessedUserId = userScoreData.guesses[answer.id];
            const guessedUser = groupMembers.find(member => member.id === guessedUserId);
            answer.guessedUsername = guessedUser ? guessedUser.name : 'Unknown User';
          });
        }
        
        setAnswers(formattedAnswers);
        break;

      default:
        setGameState('answer');
    }
  };

  const handleAnswerSubmit = (answer) => {
    try {
      const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');
      gameData[gameId] = {
        answer,
        timestamp: new Date().toLocaleString('en-CA', { timeZone: 'America/New_York' })
      };
      localStorage.setItem('gameData', JSON.stringify(gameData));

      alert('Your answer has been submitted!');
      navigate(`/game/${gameId}/guess`);
    } catch (err) {
      console.error('Error saving answer:', err);
      alert('Failed to save your answer');
    }
  };

  const handleGuessesSubmit = async (guesses) => {
    try {
      // Calculate results first
      const answersWithUsers = answers.map(answer => {
        const guessedUserId = guesses[answer.id];
        const guessedUser = groupMembers.find(member => member.id === guessedUserId);
  
        return {
          ...answer,
          guessedUsername: guessedUser ? guessedUser.name : 'Unknown User',
          username: answer.username || 'Anonymous'
        };
      });
  
      let correctCount = 0;
      answersWithUsers.forEach(answer => {
        if (answer.guessedUsername === answer.username) {
          correctCount++;
        }
      });
  
      let pointsEarned = correctCount * 10;
      const allCorrect = correctCount === answersWithUsers.length && answersWithUsers.length > 0;
      if (allCorrect) {
        pointsEarned += 5;
      }
      
      const resultsData = {
        correctGuesses: correctCount,
        pointsEarned: pointsEarned,
        perfectScore: allCorrect
      };
  
      // First save to Firestore if user is logged in
      if (userId) {
        const scoreData = {
          userId: userId,
          questionId: yesterdayPrompt,
          guesses: guesses,
          correctGuesses: correctCount,
          pointsEarned: pointsEarned,
          perfectScore: allCorrect,
          timestamp: new Date().toLocaleString('en-CA', { timeZone: 'America/New_York' })
        };
        
        // Save to the userScores collection
        const scoreRef = doc(collection(db, 'userScores'));
        await setDoc(scoreRef, scoreData);
        
        // Also update the user's total points
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentPoints = userDoc.data().points || 0;
          await updateDoc(userRef, {
            points: currentPoints + pointsEarned
          });
        }
        
        // Update the last guess date in the user document
        await updateDoc(userRef, {
          lastGuessDate: new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
        });
      }
  
      // Only after Firestore operations succeed, update localStorage and state
      const guessData = JSON.parse(localStorage.getItem('guessData') || '{}');
      guessData[gameId] = {
        guesses,
        timestamp: new Date().toLocaleString('en-CA', { timeZone: 'America/New_York' })
      };
      localStorage.setItem('guessData', JSON.stringify(guessData));
  
      setHasGuessedToday(true);
      setAnswers(answersWithUsers);
      setGameState('results');
      setResults(resultsData);
  
    } catch (err) {
      console.error('Error processing guesses:', err);
      setError('Failed to process your guesses. Please try again.');
      // Optionally add retry logic here
    }
  };

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

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Daily Prompt</h1>
        <div className="error-container">
          <p className="error-title">Error:</p>
          <p>{error}</p>
          <button onClick={() => navigate('/home')} className="home-button">
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
          prompt={dailyPrompt}
          onAnswerSubmit={handleAnswerSubmit}
          timeRemaining={3600}
        />
      )}

      {gameState === 'guess' && (
        <GuessAnswers 
          answers={answers}
          groupMembers={groupMembers}
          onSubmitGuesses={handleGuessesSubmit}
          question={yesterdayPrompt}
          questionId={yesterdayPrompt.id || yesterdayPrompt}
        />
      )}

      {gameState === 'results' && (
        <Results 
          game={yesterdayPrompt}
          answers={answers}
          results={results}
          hasGuessedToday={hasGuessedToday}
        />
      )}
    </div>
  );
};

export default GamePage;