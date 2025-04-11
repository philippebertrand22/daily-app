import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createESTTimestamp } from '../utils/estTimestamp';
import { auth, db } from '../../firebaseConfig';
import { getDailyQuestion } from './questionFetcher';
import { 
  doc, 
  setDoc, 
  collection, 
  where, 
  getDocs,
  getDoc,
  orderBy,
  limit,
  query
} from 'firebase/firestore';

const AnswerPrompt = () => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Fetch the most recent daily question
  const fetchLatestQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      // First, get the question text from the questionFetcher
      const questionText = await getDailyQuestion();
      
      if (questionText) {
        // Then, fetch the document from Firestore to get the ID
        const questionsRef = collection(db, 'daily_questions');
        const dateString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
        const dailyQuestionId = `daily_${dateString}`;
        
        // Get the document by ID
        const questionDoc = await getDoc(doc(questionsRef, dailyQuestionId));
        
        if (questionDoc.exists()) {
          // Set the question with its ID
          setQuestion({
            ...questionDoc.data(),
            id: questionDoc.id
          });
          
          // Reset error if previously set
          setError('');
          setCanSubmit(true);
        } else {
          setError('Could not retrieve question details');
          setCanSubmit(false);
        }
      } else {
        setError('No questions available');
        setCanSubmit(false);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Failed to load today\'s question: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch the latest question on component mount
  useEffect(() => {
    fetchLatestQuestion();
  }, [fetchLatestQuestion]);
  
  // Check daily submission
  const checkDailySubmission = useCallback(async () => {
    if (isLoading) return; // Skip if still loading
    
    if (!question || !auth.currentUser) {
      console.log("Can't check submission: missing question or user");
      return; // Don't modify canSubmit here, wait until data is available
    }
  
    try {
      const answersRef = collection(
        db, 
        'daily_questions', 
        question.id,
        'answers'
      );
  
      const q = query(
        answersRef,
        where('userId', '==', auth.currentUser.uid)
      );
  
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} previous answers from this user`);
  
      if (!querySnapshot.empty) {
        setCanSubmit(false);
        setError('You have already answered today\'s question');
      } else {
        console.log("User can submit - no previous answers found");
        setCanSubmit(true); // Explicitly set to true if no previous answer
      }
    } catch (error) {
      console.error('Submission check error:', error);
      // Don't modify canSubmit on error, leave it as is
    }
  }, [question, auth.currentUser, isLoading]);
  
  // Check submission eligibility when question or user changes
  useEffect(() => {
    checkDailySubmission();
  }, [checkDailySubmission]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    
    // Validate answer
    const trimmedAnswer = answer.trim();
    
    if (!trimmedAnswer) {
      setError('Please enter an answer');
      return;
    }
  
    if (trimmedAnswer.length < 10) {
      setError('Answer must be at least 10 characters');
      return;
    }
  
    if (trimmedAnswer.length > 1000) {
      setError('Answer cannot exceed 1000 characters');
      return;
    }
    
    // Check authentication
    if (!auth.currentUser) {
      setError('You must be logged in');
      return;
    }
    
    // Check submission eligibility
    if (!canSubmit) {
      setError('You can only submit one answer per day');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First fetch the user's data to get the username
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      console.log('User snapshot:', userSnap.data());
      
      // Option 1: Create a new collection for all answers
      const answersCollectionRef = collection(db, 'answers');
      const newAnswerRef = doc(answersCollectionRef); // Auto-generate ID
  
      let username = 'Anonymous';
      if (userSnap.exists()) {
        username = userSnap.data()?.profile?.username || 'Anonymous';
        console.log('Username:', username);
      }

      await setDoc(newAnswerRef, {
        userId: auth.currentUser.uid,
        answer: trimmedAnswer,
        questionId: question.id,
        question: question.question,
        createdAt: createESTTimestamp(),
        username: username || 'Anonymous'
      });
      
      // Also store reference in original subcollection to track who answered
      const questionAnswerRef = doc(
        db, 
        'daily_questions', 
        question.id,
        'answers',
        auth.currentUser.uid
      );
      
      await setDoc(questionAnswerRef, {
        userId: auth.currentUser.uid,
        answerId: newAnswerRef.id,
        createdAt: createESTTimestamp()
      });
      
      // Navigate to home or success page
      navigate('/game/guess');
    } catch (error) {
      console.error('Submission error:', error);
      setError(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <div>Loading question...</div>;
  }
  
  return (
    <div className="game-card">
      <div className="game-card-header">
        <h2 className="game-card-title">Today's Question</h2>
      </div>
      <div className="game-card-content">
        {question ? (
          <p className="question-text">{question.question}</p>
        ) : (
          <p className="question-text">No question available</p>
        )}
        
        {error && (
          <div 
            className="error-message" 
            style={{ 
              color: 'red', 
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#ffeeee',
              borderRadius: '4px'
            }}
          >
            {error}
          </div>
        )}
               
        <form onSubmit={handleSubmit}>
          <textarea
            className="answer-input"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            disabled={!canSubmit || !question}
            maxLength={1000}
          />
          <div style={{ 
            color: answer.length > 1000 ? 'red' : 'gray',
            textAlign: 'right',
            fontSize: '0.8em'
          }}>
            {answer.length}/1000 characters
          </div>
          
          <button
            type="submit" 
            className="submit-button"
            disabled={
              isSubmitting || 
              !canSubmit || 
              !question ||
              !answer.trim() || 
              answer.trim().length < 1 || 
              answer.length > 1000
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
                 
          <button 
            style={{ marginTop: '10px' }}
            onClick={() => navigate('/home')}
            className='action-button blue-button'
            type="button"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnswerPrompt;