import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  query, 
  collection, 
  where, 
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

const AnswerPrompt = () => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch the most recent daily question
  const fetchLatestQuestion = useCallback(async () => {
    try {
      const questionsRef = collection(db, 'daily_questions');
      const q = query(
        questionsRef, 
        orderBy('selected_at', 'desc'), // Sort by the selected_at field
        limit(1) // Only get the most recent question
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const latestQuestion = querySnapshot.docs[0].data();
        const questionId = querySnapshot.docs[0].id;
        
        // Set the question and its ID
        setQuestion({
          ...latestQuestion,
          id: questionId
        });
      } else {
        setError('No questions available');
        setCanSubmit(false);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Failed to load today\'s question');
      setCanSubmit(false);
    }
  }, []);
  
  // Fetch the latest question on component mount
  useEffect(() => {
    fetchLatestQuestion();
  }, [fetchLatestQuestion]);
  
  // Check daily submission
  const checkDailySubmission = useCallback(async () => {
    if (!question || !auth.currentUser) {
      setCanSubmit(false);
      return;
    }

    try {
      const answersRef = collection(
        db, 
        'daily_questions', 
        question.id,  // This is the question document ID
        'answers' // Subcollection of answers
      );

      const q = query(
        answersRef,
        where('userId', '==', auth.currentUser.uid) // Check if the current user already answered
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setCanSubmit(false);
        setError('You have already answered today\'s question');
      }
    } catch (error) {
      console.error('Submission check error:', error);
    }
  }, [question]);
  
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
      // Save answer to Firestore under the question's answers subcollection
      const answerRef = doc(
        db, 
        'daily_questions', 
        question.id, // Question ID
        'answers', // Subcollection of answers
        auth.currentUser.uid // Document ID is the user's UID
      );
      
      await setDoc(answerRef, {
        userId: auth.currentUser.uid,
        answer: trimmedAnswer,
        questionId: question.id,
        question: question.question,
        createdAt: serverTimestamp(),
        userDisplayName: auth.currentUser.displayName || 'Anonymous'
      });
      
      // Navigate or show success
      navigate('/home');
    } catch (error) {
      console.error('Submission error:', error);
      setError(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (!question) {
    return <div>Loading question...</div>;
  }
  
  return (
    <div className="game-card">
      <div className="game-card-header">
        <h2 className="game-card-title">Today's Question</h2>
      </div>
      <div className="game-card-content">
        <p className="question-text">{question.question}</p>
        
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
            disabled={!canSubmit}
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
              !answer.trim() || 
              isSubmitting || 
              !canSubmit || 
              answer.length < 10 || 
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
