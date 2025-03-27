import { collection, query, getDocs, addDoc, limit, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

// Function to get a unique daily question
export async function getDailyQuestion() {
  try {
    // Get today's date
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Reference to the daily questions collection
    const dailyQuestionsRef = collection(db, 'daily_questions');

    // Check if a question has already been selected for today
    const dailyQuestionQuery = query(
      dailyQuestionsRef, 
      where('date', '==', dateString),
      limit(1)
    );

    const dailyQuestionSnapshot = await getDocs(dailyQuestionQuery);

    // If a question exists for today, return it
    if (!dailyQuestionSnapshot.empty) {
      const existingQuestion = dailyQuestionSnapshot.docs[0].data();
      return existingQuestion.question;
    }

    // If no question for today, select a new one
    return await selectAndSaveDailyQuestion(dateString);

  } catch (error) {
    console.error("Error getting daily question:", error);
    // Fallback to a default question if something goes wrong
    return "What's your favorite type of cheese?";
  }
}

// Function to select and save a new daily question
async function selectAndSaveDailyQuestion(dateString) {
  try {
    // Reference to the questions collection
    const questionsRef = collection(db, 'questions');

    // Get all questions
    const questionsSnapshot = await getDocs(questionsRef);
    const allQuestions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Randomly select a question
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];

    // Save the selected question to daily_questions collection
    const dailyQuestionDoc = {
      date: dateString,
      question: randomQuestion.question_text,
      question_id: randomQuestion.id,
      selected_at: new Date().toISOString()
    };

    // Add to daily_questions collection
    const dailyQuestionsRef = collection(db, 'daily_questions');
    await addDoc(dailyQuestionsRef, dailyQuestionDoc);

    return randomQuestion.question_text;

  } catch (error) {
    console.error("Error selecting daily question:", error);
    return "What's your favorite type of cheese?";
  }
}

// Export for use in other components
export default {
  getDailyQuestion,
  selectAndSaveDailyQuestion
};