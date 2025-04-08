import { collection, query, getDocs, addDoc, limit, where, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

// A local cache to prevent multiple fetches in the same session
let cachedDailyQuestion = null;
let cachedDate = null;
let cachedYesterdayQuestion = null;
let cachedYesterdayDate = null;

function getDateString(date) {
  console.log("Date: ", date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }))
  return date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function getTodayDateString() {
  return getDateString(new Date());
}

function getYesterdayDateString() {
  const date = new Date();
  // Move to yesterday in Eastern Time
  date.setDate(date.getDate() - 1);
  return getDateString(date);
}

// Function to get a unique daily question
export async function getDailyQuestion() {
  try {
    // Get today's date
    const dateString = getTodayDateString();
    
    // Return cached question if we already fetched one today in this session
    if (cachedDailyQuestion && cachedDate === dateString) {
      //console.log("Returning cached daily question");
      return cachedDailyQuestion;
    }

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
      cachedDailyQuestion = existingQuestion.question;
      cachedDate = dateString;
      //console.log("Found existing daily question:", cachedDailyQuestion);
      return existingQuestion.question;
    }

    // If no question for today, select a new one using transaction to prevent race conditions
    const newQuestion = await selectAndSaveDailyQuestion(dateString);
    cachedDailyQuestion = newQuestion;
    cachedDate = dateString;
    return newQuestion;

  } catch (error) {
    console.error("Error getting daily question:", error);
    // Fallback to a default question if something goes wrong
    return "What's your favorite type of cheese?";
  }
}

// Function to get yesterday's question
export async function getYesterdayQuestion() {
  try {
    // Get yesterday's date
    const dateString = getYesterdayDateString();
    
    // Return cached yesterday's question if we already fetched it in this session
    if (cachedYesterdayQuestion && cachedYesterdayDate === dateString) {
      //console.log("Returning cached yesterday's question");
      return cachedYesterdayQuestion;
    }

    // Reference to the daily questions collection
    const dailyQuestionsRef = collection(db, 'daily_questions');

    // Check if a question exists for yesterday
    const yesterdayQuestionQuery = query(
      dailyQuestionsRef, 
      where('date', '==', dateString),
      limit(1)
    );

    const yesterdayQuestionSnapshot = await getDocs(yesterdayQuestionQuery);

    // If a question exists for yesterday, return it
    if (!yesterdayQuestionSnapshot.empty) {
      const existingQuestion = yesterdayQuestionSnapshot.docs[0].data();
      cachedYesterdayQuestion = existingQuestion.question;
      cachedYesterdayDate = dateString;
      //console.log("Found yesterday's question:", cachedYesterdayQuestion);
      return existingQuestion.question;
    }

    // If no question for yesterday, return null
    console.log("No question found for yesterday");
    return null;

  } catch (error) {
    console.error("Error getting yesterday's question:", error);
    return null;
  }
}

// Function to select and save a new daily question
async function selectAndSaveDailyQuestion(dateString) {
  try {
    // First check once more if a question was added while we were processing
    // This helps prevent race conditions between multiple clients
    const dailyQuestionsRef = collection(db, 'daily_questions');
    const finalCheckQuery = query(
      dailyQuestionsRef,
      where('date', '==', dateString),
      limit(1)
    );
    
    const finalCheckSnapshot = await getDocs(finalCheckQuery);
    if (!finalCheckSnapshot.empty) {
      const existingQuestion = finalCheckSnapshot.docs[0].data();
      console.log("Question was added by another process:", existingQuestion.question);
      return existingQuestion.question;
    }
    
    // No question found, proceed to create one
    
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

    // Use a predictable document ID based on the date to prevent duplicates
    const dailyQuestionId = `daily_${dateString}`;
    
    // Save the selected question to daily_questions collection
    const dailyQuestionDoc = {
      date: dateString,
      question: randomQuestion.question_text,
      question_id: randomQuestion.id,
      selected_at: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    };

    // Add to daily_questions collection with known ID
    await setDoc(doc(dailyQuestionsRef, dailyQuestionId), dailyQuestionDoc);
    console.log("New daily question created:", randomQuestion.question_text);

    return randomQuestion.question_text;

  } catch (error) {
    console.error("Error selecting daily question:", error);
    return "What's your favorite type of cheese?";
  }
}

// Export for use in other components
export default {
  getDailyQuestion,
  getYesterdayQuestion,
  selectAndSaveDailyQuestion
};