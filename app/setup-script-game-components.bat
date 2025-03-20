@echo off
echo Creating Daily Prompt App - Game Components...

cd daily-prompt-app

echo Creating AnswerPrompt.js
echo import React, { useState, useRef } from 'react';^
import { Camera, Send } from 'lucide-react';^
import Timer from '../UI/Timer';^
import Card from '../UI/Card';^
import Button from '../UI/Button';^
import { gameService } from '../../services/game.service';^
^
const AnswerPrompt = ({ prompt, onAnswerSubmit, timeRemaining }) =^> {^
  const [answer, setAnswer] = useState('');^
  const [submitting, setSubmitting] = useState(false);^
  const [error, setError] = useState('');^
  const fileInputRef = useRef(null);^
  const [selectedImage, setSelectedImage] = useState(null);^
^
  const handleSubmit = async (e) =^> {^
    e.preventDefault();^
    ^
    if (!answer ^&^& !selectedImage) {^
      setError('Please provide an answer');^
      return;^
    }^
    ^
    setSubmitting(true);^
    setError('');^
    ^
    try {^
      let contentType = 'text';^
      let content = answer;^
      ^
      // If it's an image prompt and we have a file^
      if (prompt.type === 'image' ^&^& selectedImage) {^
        // Convert image to base64 string^
        content = await convertImageToBase64(selectedImage);^
        contentType = 'image';^
      }^
      ^
      // Submit the answer^
      await gameService.submitAnswer(prompt._id, content, contentType);^
      onAnswerSubmit();^
    } catch (error) {^
      setError(error.response?.data?.message ^|^| 'Failed to submit answer');^
    } finally {^
      setSubmitting(false);^
    }^
  };^
  ^
  const handleFileChange = (e) =^> {^
    if (e.target.files ^&^& e.target.files[0]) {^
      setSelectedImage(e.target.files[0]);^
    }^
  };^
  ^
  const convertImageToBase64 = (file) =^> {^
    return new Promise((resolve, reject) =^> {^
      const reader = new FileReader();^
      reader.readAsDataURL(file);^
      reader.onload = () =^> resolve(reader.result);^
      reader.onerror = error =^> reject(error);^
    });^
  };^
^
  return (^
    ^<Card^>^
      ^<div className="text-center mb-4"^>^
        ^<h2 className="text-xl font-bold"^>Today's Prompt^</h2^>^
        ^<Timer timeRemaining={timeRemaining} /^>^
      ^</div^>^
      ^
      ^<div className="bg-blue-50 p-4 rounded-lg mb-4"^>^
        ^<p className="text-lg"^>{prompt.text}^</p^>^
      ^</div^>^
      ^
      ^<form onSubmit={handleSubmit}^>^
        {prompt.type === 'text' ? (^
          ^<div className="mb-4"^>^
            ^<textarea^
              className="w-full p-3 border rounded-lg"^
              placeholder="Type your answer here..."^
              value={answer}^
              onChange={(e) =^> setAnswer(e.target.value)}^
              rows={4}^
              disabled={submitting}^
            ^>^</textarea^>^
          ^</div^>^
        ) : (^
          ^<div className="mb-4"^>^
            ^<input^
              type="file"^
              accept="image/*"^
              className="hidden"^
              ref={fileInputRef}^
              onChange={handleFileChange}^
              disabled={submitting}^
            /^>^
            ^
            ^<div className="flex items-center mb-2"^>^
              ^<Button^
                type="button"^
                onClick={() =^> fileInputRef.current.click()}^
                disabled={submitting}^
                color="secondary"^
              ^>^
                ^<Camera size={20} className="mr-2" /^>^
                Choose Image^
              ^</Button^>^
              ^
              {selectedImage ^&^& (^
                ^<span className="ml-2 text-green-600"^>^
                  {selectedImage.name}^
                ^</span^>^
              )}^
            ^</div^>^
            ^
            {selectedImage ^&^& (^
              ^<div className="mb-4"^>^
                ^<img^
                  src={URL.createObjectURL(selectedImage)}^
                  alt="Preview"^
                  className="max-w-full h-auto rounded-lg border"^
                /^>^
              ^</div^>^
            )}^
          ^</div^>^
        )}^
        ^
        {error ^&^& (^
          ^<div className="mb-4 text-red-500"^>^
            {error}^
          ^</div^>^
        )}^
        ^
        ^<Button^
          type="submit"^
          disabled={submitting}^
          loading={submitting}^
          fullWidth^
        ^>^
          ^<Send size={20} className="mr-2" /^>^
          Submit Answer^
        ^</Button^>^
      ^</form^>^
    ^</Card^>^
  );^
};^
^
export default AnswerPrompt; > src\components\Game\AnswerPrompt.js

echo Creating GuessAnswers.js
echo import React, { useState } from 'react';^
import Card from '../UI/Card';^
import Button from '../UI/Button';^
import { gameService } from '../../services/game.service';^
^
const GuessAnswers = ({ game, answers, groupMembers, onSubmitGuesses }) =^> {^
  const [guesses, setGuesses] = useState({});^
  const [error, setError] = useState('');^
  const [submitting, setSubmitting] = useState(false);^
^
  const handleSelectUser = (answerId, userId) =^> {^
    setGuesses({^
      ...guesses,^
      [answerId]: userId^
    });^
  };^
^
  const handleSubmit = async (e) =^> {^
    e.preventDefault();^
    ^
    // Ensure all answers have a guess^
    if (Object.keys(guesses).length !== answers.length) {^
      setError('Please match all answers to users');^
      return;^
    }^
    ^
    setSubmitting(true);^
    setError('');^
    ^
    try {^
      // Format guesses for API^
      const formattedGuesses = Object.entries(guesses).map(([answerId, guessedUser]) =^> ({^
        answerId,^
        guessedUser^
      }));^
      ^
      // Submit guesses^
      const result = await gameService.submitGuesses(game._id, formattedGuesses);^
      onSubmitGuesses(result);^
    } catch (error) {^
      setError(error.response?.data?.message ^|^| 'Failed to submit guesses');^
    } finally {^
      setSubmitting(false);^
    }^
  };^
^
  return (^
    ^<Card^>^
      ^<h2 className="text-xl font-bold mb-4 text-center"^>^
        Match Answers to Friends^
      ^</h2^>^
      ^
      ^<p className="mb-6 text-center text-gray-600"^>^
        Who do you think said what? Select a friend for each answer.^
      ^</p^>^
      ^
      ^<form onSubmit={handleSubmit}^>^
        {answers.map((answer, index) =^> (^
          ^<div key={answer._id} className="mb-6 bg-white p-4 rounded-lg shadow"^>^
            ^<p className="mb-3 font-medium"^>^
              Answer #{index + 1}:^
              {answer.contentType === 'text' ? (^
                ^<span className="ml-2"^>{answer.content}^</span^>^
              ) : (^
                ^<div className="mt-2"^>^
                  ^<img^
                    src={answer.content}^
                    alt={`Answer ${index + 1}`}^
                    className="max-w-full h-auto rounded-lg border"^
                  /^>^
                ^</div^>^
              )}^
            ^</p^>^
            ^
            ^<div className="mt-2"^>^
              ^<select^
                className="w-full p-2 border rounded"^
                value={guesses[answer._id] ^|^| ''}^
                onChange={(e) =^> handleSelectUser(answer._id, e.target.value)}^
                disabled={submitting}^
              ^>^
                ^<option value=""^>-- Select a friend --^</option^>^
                {groupMembers.map(member =^> (^
                  ^<option key={member._id} value={member._id}^>^
                    {member.username}^
                  ^</option^>^
                ))}^
              ^</select^>^
            ^</div^>^
          ^</div^>^
        ))}^
        ^
        {error ^&^& (^
          ^<div className="mb-4 text-red-500"^>^
            {error}^
          ^</div^>^
        )}^
        ^
        ^<Button^
          type="submit"^
          disabled={submitting ^|^| Object.keys(guesses).length !== answers.length}^
          loading={submitting}^
          fullWidth^
        ^>^
          Submit Guesses^
        ^</Button^>^
      ^</form^>^
    ^</Card^>^
  );^
};^
^
export default GuessAnswers; > src\components\Game\GuessAnswers.js

echo Creating Results.js
echo import React from 'react';^
import Card from '../UI/Card';^
import Button from '../UI/Button';^
import { useNavigate } from 'react-router-dom';^
^
const Results = ({ game, answers, results }) =^> {^
  const navigate = useNavigate();^
  ^
  const getUserById = (userId, members) =^> {^
    return members.find(member =^> member._id === userId) ^|^| { username: 'Unknown' };^
  };^
  ^
  const getGuessedUserForAnswer = (answerId, userId, guesses) =^> {^
    const guess = guesses.find(g =^> ^
      g.answerId === answerId ^&^& g.guesser === userId^
    );^
    ^
    return guess ? guess.guessedUser : null;^
  };^
^
  return (^
    ^<Card^>^
      ^<h2 className="text-xl font-bold mb-4 text-center"^>Results^</h2^>^
      ^
      ^<div className="mb-6 p-4 bg-blue-50 rounded-lg"^>^
        ^<h3 className="font-bold mb-2"^>Today's Prompt:^</h3^>^
        ^<p^>{game.prompt.text}^</p^>^
      ^</div^>^
      ^
      ^<div className="mb-6"^>^
        ^<h3 className="font-bold mb-3"^>All Answers:^</h3^>^
        ^
        {answers.map((answer, index) =^> {^
          const user = answer.user;^
          ^
          return (^
            ^<div key={answer._id} className="mb-3 p-3 rounded-lg bg-white shadow"^>^
              ^<div className="flex items-start"^>^
                ^<div className="mr-3"^>^
                  {user.avatar ? (^
                    ^<img ^
                      src={user.avatar} ^
                      alt={user.username} ^
                      className="w-10 h-10 rounded-full"^
                    /^>^
                  ) : (^
                    ^<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"^>^
                      {user.username.charAt(0).toUpperCase()}^
                    ^</div^>^
                  )}^
                ^</div^>^
                ^
                ^<div^>^
                  ^<p className="font-medium"^>{user.username} said:^</p^>^
                  ^
                  {answer.contentType === 'text' ? (^
                    ^<p className="text-gray-700"^>{answer.content}^</p^>^
                  ) : (^
                    ^<div className="mt-2"^>^
                      ^<img^
                        src={answer.content}^
                        alt={`${user.username}'s answer`}^
                        className="max-w-full h-auto rounded-lg border"^
                      /^>^
                    ^</div^>^
                  )}^
                ^</div^>^
              ^</div^>^
            ^</div^>^
          );^
        })}^
      ^</div^>^
      ^
      {results ^&^& (^
        ^<div className="mb-6 p-4 bg-green-50 rounded-lg"^>^
          ^<h3 className="font-bold mb-2"^>Your Score:^</h3^>^
          ^<p^>{results.correctGuesses} correct guesses (+{results.pointsEarned} points)^</p^>^
        ^</div^>^
      )}^
      ^
      ^<div className="flex space-x-4"^>^
        ^<Button onClick={() =^> navigate('/')} fullWidth^>^
          Back to Home^
        ^</Button^>^
        ^
        ^<Button onClick={() =^> navigate('/leaderboard')} color="secondary" fullWidth^>^
          View Leaderboard^
        ^</Button^>^
      ^</div^>^
    ^</Card^>^
  );^
};^
^
export default Results; > src\components\Game\Results.js

echo Game components created.
echo Run 5-setup-pages.bat next.
