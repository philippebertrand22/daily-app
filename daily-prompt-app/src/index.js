import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {db} from './firebaseConfig'; // Import your Firebase configuration
import { questions } from './questions'; // Import your questions array
import { createESTTimestamp } from './components/utils/estTimestamp';

import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';

async function insertQuestions() {
    try {
        // Get a reference to the questions collection
        const questionsCollection = collection(db, 'questions');
        
        // Create a batch for efficient writing
        const batch = writeBatch(db);
        
        // Prepare questions for batch insertion
        questions.forEach((questionText, index) => {
            // Create a new document reference with a sequential ID
            const docRef = doc(questionsCollection, `question_${index + 1}`);
            
            // Prepare the document data
            const questionData = {
                question_text: questionText,
                question_number: index + 1,
                category: 'Jackbox-style',
                status: 'unprocessed',
                created_at: createESTTimestamp()
            };
            
            // Add to batch
            batch.set(docRef, questionData);
        });
        
        // Commit the batch
        await batch.commit();
        
        console.log(`Successfully inserted ${questions.length} questions to Firestore.`);
    } catch (error) {
        console.error('Error inserting questions:', error);
    }
}

// Call the function to insert questions
// Uncomment the following line to insert questions into Firestore
  //insertQuestions();

// Render the app regardless of Firebase connection
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
