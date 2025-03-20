@echo off
echo Creating Daily Prompt App - Controllers...

cd daily-prompt-app

echo Creating auth.controller.js
echo const jwt = require('jsonwebtoken');^
const User = require('../models/User');^
^
// Generate JWT^
const generateToken = (id) =^> {^
  return jwt.sign({ id }, process.env.JWT_SECRET, {^
    expiresIn: '30d',^
  });^
};^
^
// @desc    Register a new user^
// @route   POST /api/auth/register^
// @access  Public^
const registerUser = async (req, res) =^> {^
  try {^
    const { username, email, password } = req.body;^
    ^
    // Check if user exists^
    const userExists = await User.findOne({ $or: [{ email }, { username }] });^
    ^
    if (userExists) {^
      return res.status(400).json({ message: 'User already exists' });^
    }^
    ^
    // Create user^
    const user = await User.create({^
      username,^
      email,^
      password,^
    });^
    ^
    if (user) {^
      res.status(201).json({^
        _id: user._id,^
        username: user.username,^
        email: user.email,^
        points: user.points,^
        token: generateToken(user._id),^
      });^
    } else {^
      res.status(400).json({ message: 'Invalid user data' });^
    }^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Auth user ^& get token^
// @route   POST /api/auth/login^
// @access  Public^
const loginUser = async (req, res) =^> {^
  try {^
    const { email, password } = req.body;^
    ^
    // Check for user email^
    const user = await User.findOne({ email });^
    ^
    // Check if user exists and password matches^
    if (user ^&^& (await user.matchPassword(password))) {^
      res.json({^
        _id: user._id,^
        username: user.username,^
        email: user.email,^
        points: user.points,^
        token: generateToken(user._id),^
      });^
    } else {^
      res.status(401).json({ message: 'Invalid email or password' });^
    }^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get user profile^
// @route   GET /api/auth/profile^
// @access  Private^
const getUserProfile = async (req, res) =^> {^
  try {^
    const user = await User.findById(req.user._id).select('-password');^
    ^
    if (user) {^
      res.json(user);^
    } else {^
      res.status(404).json({ message: 'User not found' });^
    }^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Update user profile^
// @route   PUT /api/auth/profile^
// @access  Private^
const updateUserProfile = async (req, res) =^> {^
  try {^
    const user = await User.findById(req.user._id);^
    ^
    if (user) {^
      user.username = req.body.username ^|^| user.username;^
      user.email = req.body.email ^|^| user.email;^
      user.avatar = req.body.avatar ^|^| user.avatar;^
      ^
      if (req.body.password) {^
        user.password = req.body.password;^
      }^
      ^
      const updatedUser = await user.save();^
      ^
      res.json({^
        _id: updatedUser._id,^
        username: updatedUser.username,^
        email: updatedUser.email,^
        avatar: updatedUser.avatar,^
        points: updatedUser.points,^
        token: generateToken(updatedUser._id),^
      });^
    } else {^
      res.status(404).json({ message: 'User not found' });^
    }^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
module.exports = {^
  registerUser,^
  loginUser,^
  getUserProfile,^
  updateUserProfile,^
}; > server\controllers\auth.controller.js

echo Creating prompt.controller.js
echo const Prompt = require('../models/Prompt');^
const Group = require('../models/Group');^
^
// @desc    Create a new prompt^
// @route   POST /api/prompts^
// @access  Private^
const createPrompt = async (req, res) =^> {^
  try {^
    const { text, type, groupId, expiresAt } = req.body;^
^
    // Check if group exists and user is a member^
    const group = await Group.findById(groupId);^
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    ^
    // Check if user is member of the group^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to create prompts for this group' });^
    }^
^
    const prompt = await Prompt.create({^
      text,^
      type: type ^|^| 'text',^
      group: groupId,^
      createdBy: req.user._id,^
      expiresAt: expiresAt ^|^| new Date(Date.now() + 3600000) // Default 1 hour^
    });^
^
    res.status(201).json(prompt);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get active prompt for a group^
// @route   GET /api/prompts/active/:groupId^
// @access  Private^
const getActivePrompt = async (req, res) =^> {^
  try {^
    const groupId = req.params.groupId;^
    ^
    // Check if group exists and user is a member^
    const group = await Group.findById(groupId);^
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    ^
    // Check if user is member of the group^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view prompts for this group' });^
    }^
^
    const now = new Date();^
    const activePrompt = await Prompt.findOne({^
      group: groupId,^
      isActive: true,^
      expiresAt: { $gt: now }^
    }).sort({ createdAt: -1 });^
^
    if (!activePrompt) {^
      return res.status(404).json({ message: 'No active prompt found' });^
    }^
^
    res.json(activePrompt);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get all prompts for a group^
// @route   GET /api/prompts/group/:groupId^
// @access  Private^
const getAllPrompts = async (req, res) =^> {^
  try {^
    const groupId = req.params.groupId;^
    ^
    // Check if group exists and user is a member^
    const group = await Group.findById(groupId);^
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    ^
    // Check if user is member of the group^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view prompts for this group' });^
    }^
^
    const prompts = await Prompt.find({ group: groupId })^
      .sort({ createdAt: -1 });^
^
    res.json(prompts);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
module.exports = {^
  createPrompt,^
  getActivePrompt,^
  getAllPrompts^
}; > server\controllers\prompt.controller.js

echo Creating answer.controller.js
echo const Answer = require('../models/Answer');^
const Prompt = require('../models/Prompt');^
const Game = require('../models/Game');^
^
// @desc    Submit an answer to a prompt^
// @route   POST /api/answers^
// @access  Private^
const submitAnswer = async (req, res) =^> {^
  try {^
    const { promptId, content, contentType } = req.body;^
^
    // Check if prompt exists and is active^
    const prompt = await Prompt.findById(promptId);^
    if (!prompt) {^
      return res.status(404).json({ message: 'Prompt not found' });^
    }^
^
    if (!prompt.isActive ^|^| prompt.expiresAt < new Date()) {^
      return res.status(400).json({ message: 'Prompt is no longer active' });^
    }^
^
    // Check if user already submitted an answer for this prompt^
    const existingAnswer = await Answer.findOne({^
      prompt: promptId,^
      user: req.user._id^
    });^
^
    if (existingAnswer) {^
      return res.status(400).json({ message: 'You have already submitted an answer for this prompt' });^
    }^
^
    // Create answer^
    const answer = await Answer.create({^
      prompt: promptId,^
      user: req.user._id,^
      content,^
      contentType: contentType ^|^| 'text'^
    });^
^
    // Find or create a game for this prompt^
    let game = await Game.findOne({ prompt: promptId });^
    ^
    if (!game) {^
      game = await Game.create({^
        prompt: promptId,^
        group: prompt.group,^
        status: 'active',^
        endTime: prompt.expiresAt^
      });^
    }^
^
    // Add answer to game^
    game.answers.push(answer._id);^
    await game.save();^
^
    res.status(201).json(answer);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get all answers for a prompt^
// @route   GET /api/answers/prompt/:promptId^
// @access  Private^
const getAnswersForPrompt = async (req, res) =^> {^
  try {^
    const promptId = req.params.promptId;^
    ^
    // Check if prompt exists^
    const prompt = await Prompt.findById(promptId);^
    if (!prompt) {^
      return res.status(404).json({ message: 'Prompt not found' });^
    }^
^
    // Get game associated with prompt^
    const game = await Game.findOne({ prompt: promptId });^
    ^
    if (!game) {^
      return res.status(404).json({ message: 'Game not found for this prompt' });^
    }^
^
    // Check if game is in guessing or completed phase^
    if (game.status === 'active') {^
      return res.status(403).json({ message: 'Answers cannot be viewed until guessing phase begins' });^
    }^
^
    // Get all answers for the prompt^
    const answers = await Answer.find({ prompt: promptId })^
      .select('-user'); // Don't reveal who submitted each answer^
^
    res.json(answers);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
module.exports = {^
  submitAnswer,^
  getAnswersForPrompt^
}; > server\controllers\answer.controller.js

echo Creating game.controller.js
echo const Game = require('../models/Game');^
const Answer = require('../models/Answer');^
const User = require('../models/User');^
const Group = require('../models/Group');^
^
// @desc    Start the guessing phase for a game^
// @route   POST /api/games/start-guessing/:gameId^
// @access  Private^
const startGuessingPhase = async (req, res) =^> {^
  try {^
    const gameId = req.params.gameId;^
    ^
    // Find the game^
    const game = await Game.findById(gameId);^
    if (!game) {^
      return res.status(404).json({ message: 'Game not found' });^
    }^
    ^
    // Check if user is in the group^
    const group = await Group.findById(game.group);^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to modify this game' });^
    }^
    ^
    // Check if game is in active phase^
    if (game.status !== 'active') {^
      return res.status(400).json({ message: 'Game is not in active phase' });^
    }^
    ^
    // Update game to guessing phase^
    game.status = 'guessing';^
    game.guessPhaseStartTime = new Date();^
    game.guessPhaseEndTime = new Date(Date.now() + 3600000); // 1 hour for guessing^
    ^
    await game.save();^
    ^
    res.json(game);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Submit guesses for a game^
// @route   POST /api/games/submit-guesses/:gameId^
// @access  Private^
const submitGuesses = async (req, res) =^> {^
  try {^
    const gameId = req.params.gameId;^
    const { guesses } = req.body;^
    ^
    // Find the game^
    const game = await Game.findById(gameId);^
    if (!game) {^
      return res.status(404).json({ message: 'Game not found' });^
    }^
    ^
    // Check if user is in the group^
    const group = await Group.findById(game.group);^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to participate in this game' });^
    }^
    ^
    // Check if game is in guessing phase^
    if (game.status !== 'guessing') {^
      return res.status(400).json({ message: 'Game is not in guessing phase' });^
    }^
    ^
    // Check if user already submitted guesses^
    const existingGuesses = game.guesses.filter(guess =^> ^
      guess.guesser.toString() === req.user._id.toString()^
    );^
    ^
    if (existingGuesses.length > 0) {^
      return res.status(400).json({ message: 'You have already submitted guesses for this game' });^
    }^
    ^
    // Process guesses^
    let correctGuesses = 0;^
    ^
    for (const guess of guesses) {^
      // Find the actual answer^
      const answer = await Answer.findById(guess.answerId);^
      if (!answer) {^
        return res.status(404).json({ message: `Answer with ID ${guess.answerId} not found` });^
      }^
      ^
      // Check if guess is correct^
      const isCorrect = answer.user.toString() === guess.guessedUser.toString();^
      if (isCorrect) {^
        correctGuesses++;^
      }^
      ^
      // Add guess to game^
      game.guesses.push({^
        guesser: req.user._id,^
        answerId: guess.answerId,^
        guessedUser: guess.guessedUser,^
        isCorrect^
      });^
    }^
    ^
    // Check if all members have submitted guesses and if so, complete the game^
    const allMembersCount = group.members.length;^
    const uniqueGuessers = new Set(game.guesses.map(guess =^> guess.guesser.toString()));^
    ^
    if (uniqueGuessers.size === allMembersCount) {^
      game.status = 'completed';^
      game.endTime = new Date();^
      ^
      // Calculate and update results^
      await calculateGameResults(game);^
    }^
    ^
    await game.save();^
    ^
    // Update user points^
    const pointsEarned = correctGuesses * 10; // 10 points per correct guess^
    await User.findByIdAndUpdate(^
      req.user._id,^
      { $inc: { points: pointsEarned } }^
    );^
    ^
    res.json({^
      game,^
      userResults: {^
        correctGuesses,^
        pointsEarned^
      }^
    });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// Helper function to calculate game results^
const calculateGameResults = async (game) =^> {^
  const results = [];^
  const uniqueGuessers = [...new Set(game.guesses.map(guess =^> guess.guesser.toString()))];^
  ^
  for (const guesser of uniqueGuessers) {^
    const userGuesses = game.guesses.filter(guess =^> ^
      guess.guesser.toString() === guesser.toString()^
    );^
    ^
    const correctGuesses = userGuesses.filter(guess =^> guess.isCorrect).length;^
    const pointsEarned = correctGuesses * 10; // 10 points per correct guess^
    ^
    results.push({^
      user: guesser,^
      pointsEarned,^
      correctGuesses^
    });^
  }^
  ^
  game.results = results;^
  return game;^
};^
^
// @desc    Get results for a completed game^
// @route   GET /api/games/results/:gameId^
// @access  Private^
const getGameResults = async (req, res) =^> {^
  try {^
    const gameId = req.params.gameId;^
    ^
    // Find the game^
    const game = await Game.findById(gameId)^
      .populate('prompt')^
      .populate('answers')^
      .populate('results.user', 'username avatar')^
      .populate({^
        path: 'guesses.guesser',^
        select: 'username avatar'^
      })^
      .populate({^
        path: 'guesses.guessedUser',^
        select: 'username avatar'^
      });^
    ^
    if (!game) {^
      return res.status(404).json({ message: 'Game not found' });^
    }^
    ^
    // Check if user is in the group^
    const group = await Group.findById(game.group);^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view this game' });^
    }^
    ^
    // Check if game is completed^
    if (game.status !== 'completed') {^
      return res.status(400).json({ message: 'Game results are not available yet' });^
    }^
    ^
    // Get answers with user info (only revealed after game completion)^
    const answers = await Answer.find({ _id: { $in: game.answers } })^
      .populate('user', 'username avatar');^
    ^
    res.json({^
      game,^
      answers,^
      userResults: game.results.find(result =^> ^
        result.user._id.toString() === req.user._id.toString()^
      )^
    });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get current active game for a group^
// @route   GET /api/games/current/:groupId^
// @access  Private^
const getCurrentGame = async (req, res) =^> {^
  try {^
    const groupId = req.params.groupId;^
    ^
    // Check if user is in the group^
    const group = await Group.findById(groupId);^
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    ^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view games for this group' });^
    }^
    ^
    // Find active game for the group^
    const game = await Game.findOne({^
      group: groupId,^
      status: { $in: ['active', 'guessing'] }^
    }).populate('prompt');^
    ^
    if (!game) {^
      return res.status(404).json({ message: 'No active game found for this group' });^
    }^
    ^
    // Check if user has already answered^
    let userHasAnswered = false;^
    if (game.answers ^&^& game.answers.length > 0) {^
      const userAnswer = await Answer.findOne({^
        _id: { $in: game.answers },^
        user: req.user._id^
      });^
      userHasAnswered = !!userAnswer;^
    }^
    ^
    // Check if user has already submitted guesses^
    let userHasGuessed = false;^
    if (game.guesses ^&^& game.guesses.length > 0) {^
      userHasGuessed = game.guesses.some(guess =^> ^
        guess.guesser.toString() === req.user._id.toString()^
      );^
    }^
    ^
    // If game is in guessing phase, get anonymized answers^
    let answers = [];^
    if (game.status === 'guessing') {^
      answers = await Answer.find({ _id: { $in: game.answers } })^
        .select('-user'); // Don't reveal who submitted each answer^
    }^
    ^
    res.json({^
      game,^
      userHasAnswered,^
      userHasGuessed,^
      answers: game.status === 'guessing' ? answers : []^
    });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
// @desc    Get a specific game by ID^
// @route   GET /api/games/:id^
// @access  Private^
const getGameById = async (req, res) =^> {^
  try {^
    const gameId = req.params.id;^
    
    // Find the game^
    const game = await Game.findById(gameId).populate('prompt');^
    
    if (!game) {^
      return res.status(404).json({ message: 'Game not found' });^
    }^
    
    // Check if user is in the group^
    const group = await Group.findById(game.group);^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view this game' });^
    }^
    
    // Check if user has already answered^
    let userHasAnswered = false;^
    if (game.answers ^&^& game.answers.length > 0) {^
      const userAnswer = await Answer.findOne({^
        _id: { $in: game.answers },^
        user: req.user._id^
      });^
      userHasAnswered = !!userAnswer;^
    }^
    
    // Check if user has already submitted guesses^
    let userHasGuessed = false;^
    if (game.guesses ^&^& game.guesses.length > 0) {^
      userHasGuessed = game.guesses.some(guess =^> ^
        guess.guesser.toString() === req.user._id.toString()^
      );^
    }^
    
    res.json({^
      game,^
      userHasAnswered,^
      userHasGuessed^
    });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
};^
^
module.exports = {^
  startGuessingPhase,^
  submitGuesses,^
  getGameResults,^
  getCurrentGame,^
  getGameById^
}; > server\controllers\game.controller.js

echo Controllers created.
echo Run 8-setup-routes.bat next.
