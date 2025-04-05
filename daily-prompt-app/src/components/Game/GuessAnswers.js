import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import '../../pages/GamePageStyles.css';

const GuessAnswers = ({ answers = [], groupMembers = [], onSubmitGuesses, question = "Yesterday's Question", questionId }) => {
  const [guesses, setGuesses] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // Check if user has already submitted guesses for this question
  useEffect(() => {
    const checkDailySubmission = async () => {
      if (!questionId || !auth.currentUser) {
        console.log("Can't check submission: missing questionId or user");
        setIsLoading(false);
        return;
      }
      
      try {
        const guessesRef = collection(db, 'guesses');
        
        const q = query(
          guessesRef,
          where('userId', '==', auth.currentUser.uid),
          where('questionId', '==', questionId)
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} previous guesses from this user for this question`);
        
        if (!querySnapshot.empty) {
          setCanSubmit(false);
          setError('You have already submitted guesses for this question');
        } else {
          console.log("User can submit - no previous guesses found");
          setCanSubmit(true);
        }
      } catch (error) {
        console.error('Submission check error:', error);
        setError(`Error checking submission eligibility: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    checkDailySubmission();
  }, [questionId]);

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
    
    if (!canSubmit) {
      setError('You have already submitted guesses for this question');
      return;
    }
    
    if (!auth.currentUser) {
      setError('You must be logged in');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // First fetch the user's data to get the username
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      let username = 'Anonymous';
      if (userSnap.exists()) {
        username = userSnap.data()?.profile?.username || 'Anonymous';
        console.log('Username:', username);
      }
      
      // Create a new document in the guesses collection
      const guessesCollectionRef = collection(db, 'guesses');
      const newGuessRef = doc(guessesCollectionRef); // Auto-generate ID
      
      // Format the guess data for storage
      const guessData = {
        userId: auth.currentUser.uid,
        username: username,
        questionId: questionId,
        question: question,
        guesses: guesses, // Store the guesses object with answerId -> userId mapping
        createdAt: serverTimestamp(),
        correctCount: 0, // This can be calculated later or updated after submission
      };
      //console.log('Guess data:', guessData);
      //console.log('newGuessRef', newGuessRef);
      
      await setDoc(newGuessRef, guessData);
      console.log('Guesses saved with ID:', newGuessRef.id);
      
      // Call the parent component's onSubmitGuesses if it exists
      if (onSubmitGuesses) {
        await onSubmitGuesses(guesses, newGuessRef.id);
      }
      
      // Navigate back to home or to a results page
      navigate('/game/results');
    } catch (err) {
      console.error('Failed to submit guesses:', err);
      setError(`Failed to submit guesses: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <div>Checking submission eligibility...</div>;
  }

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
        
        {error && (
          <div 
            className="error-message" 
            style={{ 
              color: 'red', 
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#ffeeee',
              borderRadius: '4px',
              margin: '15px'
            }}
          >
            {error}
          </div>
        )}
        
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
                      disabled={submitting || !canSubmit}
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

          {answers.length > 0 && (
            <button
              style={{ margin: '15px' }}
              type="submit"
              disabled={
                submitting || 
                !canSubmit ||
                Object.keys(guesses).length !== answers.length || 
                Object.values(guesses).includes('')
              }
              className="submit-button"
            >
              {submitting ? 'Submitting...' : canSubmit ? 'Submit Guesses' : 'Already Submitted'}
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