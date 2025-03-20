@echo off
echo Creating Daily Prompt App - Pages...

cd daily-prompt-app

echo Creating HomePage.js
echo import React, { useState, useEffect, useContext } from 'react';^
import { useNavigate } from 'react-router-dom';^
import { Bell, Clock, Award } from 'lucide-react';^
import { AuthContext } from '../components/Auth/AuthContext';^
import Navbar from '../components/Layout/Navbar';^
import Card from '../components/UI/Card';^
import Button from '../components/UI/Button';^
import { groupService } from '../services/group.service';^
import { gameService } from '../services/game.service';^
^
const HomePage = () =^> {^
  const { user } = useContext(AuthContext);^
  const navigate = useNavigate();^
  const [groups, setGroups] = useState([]);^
  const [activeGames, setActiveGames] = useState([]);^
  const [loading, setLoading] = useState(true);^
  const [error, setError] = useState('');^
^
  useEffect(() =^> {^
    const fetchData = async () =^> {^
      try {^
        setLoading(true);^
        // Get user's groups^
        const userGroups = await groupService.getUserGroups();^
        setGroups(userGroups);^
        ^
        // Get active games for each group^
        const games = [];^
        for (const group of userGroups) {^
          try {^
            const gameData = await gameService.getCurrentGame(group._id);^
            if (gameData ^&^& gameData.game) {^
              games.push({^
                ...gameData.game,^
                groupName: group.name,^
                userHasAnswered: gameData.userHasAnswered,^
                userHasGuessed: gameData.userHasGuessed^
              });^
            }^
          } catch (error) {^
            // Skip if no active game for this group^
            console.log(`No active game for group ${group.name}`);^
          }^
        }^
        ^
        setActiveGames(games);^
      } catch (error) {^
        setError('Failed to load data');^
        console.error(error);^
      } finally {^
        setLoading(false);^
      }^
    };^
    ^
    fetchData();^
  }, []);^
^
  const renderActiveGames = () =^> {^
    if (activeGames.length === 0) {^
      return (^
        ^<Card^>^
          ^<div className="text-center py-6"^>^
            ^<p className="text-gray-500"^>No active games^</p^>^
            ^<p className="mt-2 text-sm text-gray-400"^>^
              Join a group or wait for the next daily prompt^
            ^</p^>^
          ^</div^>^
        ^</Card^>^
      );^
    }^
    ^
    return activeGames.map(game =^> {^
      const isAnswerPhase = game.status === 'active';^
      const isGuessingPhase = game.status === 'guessing';^
      ^
      // Calculate time remaining^
      const now = new Date();^
      const targetTime = new Date(isAnswerPhase ? game.endTime : game.guessPhaseEndTime);^
      const timeRemaining = Math.max(0, Math.floor((targetTime - now) / 1000));^
      ^
      // Format time^
      const hours = Math.floor(timeRemaining / 3600);^
      const minutes = Math.floor((timeRemaining % 3600) / 60);^
      const seconds = timeRemaining % 60;^
      const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;^
      ^
      return (^
        ^<Card key={game._id} className="mb-4"^>^
          ^<div className="flex justify-between items-start mb-4"^>^
            ^<div^>^
              ^<h3 className="font-bold"^>{game.groupName}^</h3^>^
              ^<p className="text-sm text-gray-500"^>^
                {isAnswerPhase ? 'Answer Phase' : 'Guessing Phase'}^
              ^</p^>^
            ^</div^>^
            ^<div className="flex items-center"^>^
              ^<Clock size={16} className="text-blue-500 mr-1" /^>^
              ^<span className="text-sm font-mono"^>{timeFormatted}^</span^>^
            ^</div^>^
          ^</div^>^
          ^
          ^<div className="bg-blue-50 p-3 rounded-lg mb-4"^>^
            ^<p^>{game.prompt?.text ^|^| 'Loading prompt...'}^</p^>^
          ^</div^>^
          ^
          {isAnswerPhase ? (^
            ^<div^>^
              {game.userHasAnswered ? (^
                ^<div className="text-green-600 mb-4"^>^
                  ^<p^>✓ You've submitted your answer!^</p^>^
                  ^<p className="text-sm text-gray-500"^>^
                    Waiting for others to finish or time to run out^
                  ^</p^>^
                ^</div^>^
              ) : (^
                ^<Button^
                  onClick={() =^> navigate(`/game/${game._id}`)}^
                  fullWidth^
                ^>^
                  Answer Now^
                ^</Button^>^
              )}^
            ^</div^>^
          ) : (^
            ^<div^>^
              {game.userHasGuessed ? (^
                ^<div className="text-green-600 mb-4"^>^
                  ^<p^>✓ You've submitted your guesses!^</p^>^
                  ^<p className="text-sm text-gray-500"^>^
                    Waiting for others to finish^
                  ^</p^>^
                ^</div^>^
              ) : (^
                ^<Button^
                  onClick={() =^> navigate(`/game/${game._id}`)}^
                  fullWidth^
                ^>^
                  Make Your Guesses^
                ^</Button^>^
              )}^
            ^</div^>^
          )}^
        ^</Card^>^
      );^
    });^
  };^
^
  if (loading) {^
    return (^
      ^<div^>^
        ^<Navbar /^>^
        ^<div className="container mx-auto px-4 py-8"^>^
          ^<div className="text-center py-12"^>^
            ^<p^>Loading...^</p^>^
          ^</div^>^
        ^</div^>^
      ^</div^>^
    );^
  }^
^
  return (^
    ^<div^>^
      ^<Navbar /^>^
      ^<div className="container mx-auto px-4 py-8"^>^
        ^<h1 className="text-2xl font-bold mb-6"^>Welcome, {user?.username}!^</h1^>^
        ^
        {error ^&^& (^
          ^<div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6"^>^
            {error}^
          ^</div^>^
        )}^
        ^
        ^<div className="mb-8"^>^
          ^<div className="flex justify-between items-center mb-4"^>^
            ^<h2 className="text-xl font-semibold"^>Today's Games^</h2^>^
            ^<span className="text-sm text-gray-500"^>^
              {activeGames.length} active^
            ^</span^>^
          ^</div^>^
          ^
          {renderActiveGames()}^
        ^</div^>^
        ^
        ^<div className="mb-8"^>^
          ^<div className="flex justify-between items-center mb-4"^>^
            ^<h2 className="text-xl font-semibold"^>Your Groups^</h2^>^
            ^<Button ^
              onClick={() =^> navigate('/groups')}^
              color="gray"^
              size="sm"^
            ^>^
              View All^
            ^</Button^>^
          ^</div^>^
          ^
          {groups.length === 0 ? (^
            ^<Card^>^
              ^<div className="text-center py-6"^>^
                ^<p className="text-gray-500"^>You haven't joined any groups yet^</p^>^
                ^<Button ^
                  onClick={() =^> navigate('/groups/create')}^
                  color="primary"^
                  className="mt-4"^
                ^>^
                  Create a Group^
                ^</Button^>^
              ^</div^>^
            ^</Card^>^
          ) : (^
            ^<div className="grid grid-cols-1 md:grid-cols-2 gap-4"^>^
              {groups.slice(0, 4).map(group =^> (^
                ^<Card key={group._id} className="hover:shadow-md transition-shadow"^>^
                  ^<div onClick={() =^> navigate(`/groups/${group._id}`)}^>^
                    ^<h3 className="font-bold mb-2"^>{group.name}^</h3^>^
                    ^<p className="text-sm text-gray-500 mb-3"^>^
                      {group.members.length} members^
                    ^</p^>^
                    ^<div className="flex justify-between items-center"^>^
                      ^<span className="text-xs text-gray-400"^>^
                        {group.isPrivate ? 'Private Group' : 'Public Group'}^
                      ^</span^>^
                      ^<Button^
                        onClick={(e) =^> {^
                          e.stopPropagation();^
                          navigate(`/groups/${group._id}`);^
                        }}^
                        color="gray"^
                        size="sm"^
                      ^>^
                        View^
                      ^</Button^>^
                    ^</div^>^
                  ^</div^>^
                ^</Card^>^
              ))}^
            ^</div^>^
          )}^
        ^</div^>^
        ^
        ^<div^>^
          ^<div className="flex justify-between items-center mb-4"^>^
            ^<h2 className="text-xl font-semibold"^>Leaderboard^</h2^>^
            ^<Button ^
              onClick={() =^> navigate('/leaderboard')}^
              color="gray"^
              size="sm"^
            ^>^
              View Full^
            ^</Button^>^
          ^</div^>^
          ^
          ^<Card^>^
            ^<div className="flex justify-between items-center mb-4"^>^
              ^<span className="font-bold"^>Your Rank^</span^>^
              ^<span className="font-bold text-blue-500"^>#{user?.rank ^|^| '--'}^</span^>^
            ^</div^>^
            ^
            ^<div className="flex justify-between items-center"^>^
              ^<span className="font-bold"^>Your Points^</span^>^
              ^<span className="font-bold text-blue-500"^>{user?.points ^|^| 0} pts^</span^>^
            ^</div^>^
          ^</Card^>^
        ^</div^>^
      ^</div^>^
    ^</div^>^
  );^
};^
^
export default HomePage; > src\pages\HomePage.js

echo Creating GamePage.js
echo import React, { useState, useEffect } from 'react';^
import { useParams, useNavigate } from 'react-router-dom';^
import Navbar from '../components/Layout/Navbar';^
import AnswerPrompt from '../components/Game/AnswerPrompt';^
import GuessAnswers from '../components/Game/GuessAnswers';^
import Results from '../components/Game/Results';^
import { gameService } from '../services/game.service';^
import { groupService } from '../services/group.service';^
^
const GamePage = () =^> {^
  const { gameId } = useParams();^
  const navigate = useNavigate();^
  const [game, setGame] = useState(null);^
  const [answers, setAnswers] = useState([]);^
  const [groupMembers, setGroupMembers] = useState([]);^
  const [userState, setUserState] = useState({^
    hasAnswered: false,^
    hasGuessed: false^
  });^
  const [results, setResults] = useState(null);^
  const [loading, setLoading] = useState(true);^
  const [error, setError] = useState('');^
^
  useEffect(() =^> {^
    const fetchGame = async () =^> {^
      try {^
        setLoading(true);^
        ^
        // Get game by ID - this would be a new endpoint needed^
        // For now, we'll use the current game endpoint with the group ID from the game^
        const gameResponse = await gameService.getGameById(gameId);^
        ^
        setGame(gameResponse.game);^
        ^
        // Get group members^
        const membersResponse = await groupService.getGroupMembers(gameResponse.game.group);^
        setGroupMembers(membersResponse);^
        ^
        // Set user state^
        setUserState({^
          hasAnswered: gameResponse.userHasAnswered,^
          hasGuessed: gameResponse.userHasGuessed^
        });^
        ^
        // If in guessing phase, get anonymized answers^
        if (gameResponse.game.status === 'guessing') {^
          const answersResponse = await gameService.getAnswersForPrompt(gameResponse.game.prompt._id);^
          setAnswers(answersResponse);^
        }^
        ^
        // If game is completed, get results^
        if (gameResponse.game.status === 'completed') {^
          const resultsResponse = await gameService.getGameResults(gameId);^
          setGame(resultsResponse.game);^
          setAnswers(resultsResponse.answers);^
          setResults(resultsResponse.userResults);^
        }^
      } catch (error) {^
        console.error('Failed to fetch game', error);^
        setError('Failed to load game data');^
      } finally {^
        setLoading(false);^
      }^
    };^
    ^
    fetchGame();^
  }, [gameId]);^
^
  const handleAnswerSubmit = async () =^> {^
    try {^
      setUserState({^
        ...userState,^
        hasAnswered: true^
      });^
      ^
      // Refresh game data^
      const gameResponse = await gameService.getGameById(gameId);^
      setGame(gameResponse.game);^
    } catch (error) {^
      console.error('Error after submitting answer', error);^
    }^
  };^
^
  const handleGuessesSubmit = (result) =^> {^
    setUserState({^
      ...userState,^
      hasGuessed: true^
    });^
    ^
    // If game is now completed, show results^
    if (result.game.status === 'completed') {^
      setGame(result.game);^
      setResults(result.userResults);^
    }^
  };^
^
  if (loading) {^
    return (^
      ^<div^>^
        ^<Navbar /^>^
        ^<div className="container mx-auto px-4 py-8"^>^
          ^<div className="text-center py-12"^>^
            ^<p^>Loading game...^</p^>^
          ^</div^>^
        ^</div^>^
      ^</div^>^
    );^
  }^
^
  if (error) {^
    return (^
      ^<div^>^
        ^<Navbar /^>^
        ^<div className="container mx-auto px-4 py-8"^>^
          ^<div className="bg-red-100 text-red-700 p-4 rounded-lg"^>^
            {error}^
            ^<button^
              className="block mt-4 text-blue-500"^
              onClick={() =^> navigate('/')}^
            ^>^
              Back to Home^
            ^</button^>^
          ^</div^>^
        ^</div^>^
      ^</div^>^
    );^
  }^
^
  if (!game) {^
    return (^
      ^<div^>^
        ^<Navbar /^>^
        ^<div className="container mx-auto px-4 py-8"^>^
          ^<div className="text-center py-12"^>^
            ^<p^>Game not found^</p^>^
            ^<button^
              className="block mt-4 text-blue-500 mx-auto"^
              onClick={() =^> navigate('/')}^
            ^>^
              Back to Home^
            ^</button^>^
          ^</div^>^
        ^</div^>^
      ^</div^>^
    );^
  }^
^
  return (^
    ^<div^>^
      ^<Navbar /^>^
      ^<div className="container mx-auto px-4 py-8 max-w-md"^>^
        {game.status === 'completed' ^|^| results ? (^
          ^<Results ^
            game={game} ^
            answers={answers} ^
            results={results} ^
          /^>^
        ) : game.status === 'guessing' ? (^
          userState.hasGuessed ? (^
            ^<div className="text-center py-12"^>^
              ^<p className="text-xl font-bold mb-4"^>Thanks for your guesses!^</p^>^
              ^<p className="text-gray-600 mb-6"^>^
                Waiting for others to submit their guesses...^
              ^</p^>^
              ^<button^
                className="text-blue-500"^
                onClick={() =^> navigate('/')}^
              ^>^
                Back to Home^
              ^</button^>^
            ^</div^>^
          ) : (^
            ^<GuessAnswers ^
              game={game} ^
              answers={answers} ^
              groupMembers={groupMembers}^
              onSubmitGuesses={handleGuessesSubmit} ^
            /^>^
          )^
        ) : (^
          userState.hasAnswered ? (^
            ^<div className="text-center py-12"^>^
              ^<p className="text-xl font-bold mb-4"^>Thanks for your answer!^</p^>^
              ^<p className="text-gray-600 mb-6"^>^
                Waiting for others to answer or for the time to expire...^
              ^</p^>^
              ^<button^
                className="text-blue-500"^
                onClick={() =^> navigate('/')}^
              ^>^
                Back to Home^
              ^</button^>^
            ^</div^>^
          ) : (^
            ^<AnswerPrompt ^
              prompt={game.prompt} ^
              onAnswerSubmit={handleAnswerSubmit}^
              timeRemaining={Math.max(0, new Date(game.endTime) - new Date()) / 1000}^
            /^>^
          )^
        )}^
      ^</div^>^
    ^</div^>^
  );^
};^
^
export default GamePage; > src\pages\GamePage.js

echo Creating LoginPage.js
echo import React, { useState, useContext } from 'react';^
import { Link, useNavigate } from 'react-router-dom';^
import { AuthContext } from '../components/Auth/AuthContext';^
import Card from '../components/UI/Card';^
import Button from '../components/UI/Button';^
^
const LoginPage = () =^> {^
  const [email, setEmail] = useState('');^
  const [password, setPassword] = useState('');^
  const [error, setError] = useState('');^
  const [loading, setLoading] = useState(false);^
  ^
  const { login } = useContext(AuthContext);^
  const navigate = useNavigate();^
  ^
  const handleSubmit = async (e) =^> {^
    e.preventDefault();^
    ^
    if (!email ^|^| !password) {^
      setError('Please enter both email and password');^
      return;^
    }^
    ^
    try {^
      setLoading(true);^
      setError('');^
      ^
      await login(email, password);^
      navigate('/');^
    } catch (error) {^
      setError(error.response?.data?.message ^|^| 'Login failed');^
    } finally {^
      setLoading(false);^
    }^
  };^
  ^
  return (^
    ^<div className="min-h-screen bg-gray-100 flex items-center justify-center"^>^
      ^<div className="w-full max-w-md"^>^
        ^<div className="text-center mb-8"^>^
          ^<h1 className="text-3xl font-bold"^>Daily Prompt^</h1^>^
          ^<p className="text-gray-600"^>Sign in to connect with friends^</p^>^
        ^</div^>^
        ^
        ^<Card^>^
          ^<h2 className="text-2xl font-bold mb-6 text-center"^>Sign In^</h2^>^
          ^
          {error ^&^& (^
            ^<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"^>^
              {error}^
            ^</div^>^
          )}^
          ^
          ^<form onSubmit={handleSubmit}^>^
            ^<div className="mb-4"^>^
              ^<label className="block text-gray-700 mb-2" htmlFor="email"^>^
                Email^
              ^</label^>^
              ^<input^
                type="email"^
                id="email"^
                className="w-full p-3 border rounded-lg"^
                value={email}^
                onChange={(e) =^> setEmail(e.target.value)}^
                disabled={loading}^
              /^>^
            ^</div^>^
            ^
            ^<div className="mb-6"^>^
              ^<label className="block text-gray-700 mb-2" htmlFor="password"^>^
                Password^
              ^</label^>^
              ^<input^
                type="password"^
                id="password"^
                className="w-full p-3 border rounded-lg"^
                value={password}^
                onChange={(e) =^> setPassword(e.target.value)}^
                disabled={loading}^
              /^>^
            ^</div^>^
            ^
            ^<Button^
              type="submit"^
              disabled={loading}^
              loading={loading}^
              fullWidth^
            ^>^
              Sign In^
            ^</Button^>^
          ^</form^>^
          ^
          ^<div className="mt-6 text-center"^>^
            ^<p className="text-gray-600"^>^
              Don't have an account?{' '}^
              ^<Link to="/register" className="text-blue-500 hover:underline"^>^
                Sign Up^
              ^</Link^>^
            ^</p^>^
          ^</div^>^
        ^</Card^>^
      ^</div^>^
    ^</div^>^
  );^
};^
^
export default LoginPage; > src\pages\LoginPage.js

echo Creating LeaderboardPage.js
echo import React, { useState, useEffect, useContext } from 'react';^
import { AuthContext } from '../components/Auth/AuthContext';^
import Navbar from '../components/Layout/Navbar';^
import Card from '../components/UI/Card';^
import api from '../services/api';^
^
const LeaderboardPage = () =^> {^
  const { user } = useContext(AuthContext);^
  const [leaderboard, setLeaderboard] = useState([]);^
  const [loading, setLoading] = useState(true);^
  const [error, setError] = useState('');^
^
  useEffect(() =^> {^
    const fetchLeaderboard = async () =^> {^
      try {^
        setLoading(true);^
        const response = await api.get('/users/leaderboard');^
        setLeaderboard(response.data);^
      } catch (error) {^
        console.error('Failed to fetch leaderboard', error);^
        setError('Failed to load leaderboard');^
      } finally {^
        setLoading(false);^
      }^
    };^
^
    fetchLeaderboard();^
  }, []);^
^
  if (loading) {^
    return (^
      ^<div^>^
        ^<Navbar /^>^
        ^<div className="container mx-auto px-4 py-8"^>^
          ^<div className="text-center py-12"^>^
            ^<p^>Loading leaderboard...^</p^>^
          ^</div^>^
        ^</div^>^
      ^</div^>^
    );^
  }^
^
  return (^
    ^<div^>^
      ^<Navbar /^>^
      ^<div className="container mx-auto px-4 py-8"^>^
        ^<h1 className="text-2xl font-bold mb-6"^>Leaderboard^</h1^>^
        ^
        {error ^&^& (^
          ^<div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6"^>^
            {error}^
          ^</div^>^
        )}^
        ^
        ^<Card^>^
          ^<div className="overflow-x-auto"^>^
            ^<table className="w-full"^>^
              ^<thead^>^
                ^<tr className="border-b"^>^
                  ^<th className="py-2 px-4 text-left"^>Rank^</th^>^
                  ^<th className="py-2 px-4 text-left"^>User^</th^>^
                  ^<th className="py-2 px-4 text-right"^>Points^</th^>^
                  ^<th className="py-2 px-4 text-right"^>Correct Guesses^</th^>^
                ^</tr^>^
              ^</thead^>^
              ^<tbody^>^
                {leaderboard.map((item, index) =^> (^
                  ^<tr ^
                    key={item._id} ^
                    className={`border-b ${item._id === user?._id ? 'bg-blue-50' : ''}`}^
                  ^>^
                    ^<td className="py-3 px-4"^>^
                      {index + 1}^
                      {index === 0 ^&^& ^<span className="ml-1 text-yellow-500"^>👑^</span^>}^
                    ^</td^>^
                    ^<td className="py-3 px-4 flex items-center"^>^
                      {item.avatar ? (^
                        ^<img ^
                          src={item.avatar} ^
                          alt={item.username} ^
                          className="w-8 h-8 rounded-full mr-2"^
                        /^>^
                      ) : (^
                        ^<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2"^>^
                          {item.username.charAt(0).toUpperCase()}^
                        ^</div^>^
                      )}^
                      ^<span^>^
                        {item.username}^
                        {item._id === user?._id ^&^& ^<span className="ml-1 text-xs text-blue-500"^>(You)^</span^>}^
                      ^</span^>^
                    ^</td^>^
                    ^<td className="py-3 px-4 text-right font-medium"^>^
                      {item.points} pts^
                    ^</td^>^
                    ^<td className="py-3 px-4 text-right"^>^
                      {item.correctGuesses ^|^| 0}^
                    ^</td^>^
                  ^</tr^>^
                ))}^
              ^</tbody^>^
            ^</table^>^
          ^</div^>^
        ^</Card^>^
      ^</div^>^
    ^</div^>^
  );^
};^
^
export default LeaderboardPage; > src\pages\LeaderboardPage.js

echo Main pages created successfully.
echo Run 6-setup-server.bat next.
