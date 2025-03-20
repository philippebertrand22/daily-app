@echo off
echo Creating Daily Prompt App - Routes...

cd daily-prompt-app

echo Creating auth.routes.js
echo const express = require('express');^
const router = express.Router();^
const { ^
  registerUser, ^
  loginUser, ^
  getUserProfile,^
  updateUserProfile^
} = require('../controllers/auth.controller');^
const { protect } = require('../middleware/auth.middleware');^
^
// Register new user^
router.post('/register', registerUser);^
^
// Login user^
router.post('/login', loginUser);^
^
// Get user profile^
router.get('/profile', protect, getUserProfile);^
^
// Update user profile^
router.put('/profile', protect, updateUserProfile);^
^
module.exports = router; > server\routes\auth.routes.js

echo Creating prompt.routes.js
echo const express = require('express');^
const router = express.Router();^
const { ^
  createPrompt,^
  getActivePrompt,^
  getAllPrompts^
} = require('../controllers/prompt.controller');^
const { protect } = require('../middleware/auth.middleware');^
^
// Create a new prompt^
router.post('/', protect, createPrompt);^
^
// Get active prompt for a group^
router.get('/active/:groupId', protect, getActivePrompt);^
^
// Get all prompts for a group^
router.get('/group/:groupId', protect, getAllPrompts);^
^
module.exports = router; > server\routes\prompt.routes.js

echo Creating answer.routes.js
echo const express = require('express');^
const router = express.Router();^
const { ^
  submitAnswer,^
  getAnswersForPrompt^
} = require('../controllers/answer.controller');^
const { protect } = require('../middleware/auth.middleware');^
^
// Submit an answer to a prompt^
router.post('/', protect, submitAnswer);^
^
// Get all answers for a prompt^
router.get('/prompt/:promptId', protect, getAnswersForPrompt);^
^
module.exports = router; > server\routes\answer.routes.js

echo Creating game.routes.js
echo const express = require('express');^
const router = express.Router();^
const { ^
  startGuessingPhase,^
  submitGuesses,^
  getGameResults,^
  getCurrentGame,^
  getGameById^
} = require('../controllers/game.controller');^
const { protect } = require('../middleware/auth.middleware');^
^
// Get a specific game by ID^
router.get('/:id', protect, getGameById);^
^
// Start the guessing phase for a game^
router.post('/start-guessing/:gameId', protect, startGuessingPhase);^
^
// Submit guesses for a game^
router.post('/submit-guesses/:gameId', protect, submitGuesses);^
^
// Get results for a completed game^
router.get('/results/:gameId', protect, getGameResults);^
^
// Get current active game for a group^
router.get('/current/:groupId', protect, getCurrentGame);^
^
module.exports = router; > server\routes\game.routes.js

echo Creating group.routes.js
echo const express = require('express');^
const router = express.Router();^
const { protect } = require('../middleware/auth.middleware');^
const Group = require('../models/Group');^
const User = require('../models/User');^
const crypto = require('crypto');^
^
// @desc    Get all groups for current user^
// @route   GET /api/groups/user^
// @access  Private^
router.get('/user', protect, async (req, res) =^> {^
  try {^
    const groups = await Group.find({^
      members: req.user._id^
    });^
    res.json(groups);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Get a group by ID^
// @route   GET /api/groups/:id^
// @access  Private^
router.get('/:id', protect, async (req, res) =^> {^
  try {^
    const group = await Group.findById(req.params.id)^
      .populate('creator', 'username avatar')^
      .populate('members', 'username avatar');^
    
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    
    // Check if user is a member^
    if (!group.members.some(member =^> member._id.toString() === req.user._id.toString())) {^
      return res.status(403).json({ message: 'Not authorized to view this group' });^
    }^
    
    res.json(group);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Create a new group^
// @route   POST /api/groups^
// @access  Private^
router.post('/', protect, async (req, res) =^> {^
  try {^
    const { name, description, isPrivate } = req.body;^
    
    // Generate unique invite code^
    const inviteCode = crypto.randomBytes(8).toString('hex');^
    
    const group = await Group.create({^
      name,^
      description,^
      creator: req.user._id,^
      members: [req.user._id],^
      isPrivate: isPrivate ^|^| false,^
      inviteCode^
    });^
    
    // Add group to user's groups^
    await User.findByIdAndUpdate(req.user._id, {^
      $push: { groups: group._id }^
    });^
    
    res.status(201).json(group);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Update a group^
// @route   PUT /api/groups/:id^
// @access  Private^
router.put('/:id', protect, async (req, res) =^> {^
  try {^
    const { name, description, isPrivate } = req.body;^
    
    const group = await Group.findById(req.params.id);^
    
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    
    // Check if user is the creator^
    if (group.creator.toString() !== req.user._id.toString()) {^
      return res.status(403).json({ message: 'Not authorized to update this group' });^
    }^
    
    group.name = name ^|^| group.name;^
    group.description = description ^|^| group.description;^
    
    if (typeof isPrivate !== 'undefined') {^
      group.isPrivate = isPrivate;^
    }^
    
    await group.save();^
    
    res.json(group);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Join a group using invite code^
// @route   POST /api/groups/join^
// @access  Private^
router.post('/join', protect, async (req, res) =^> {^
  try {^
    const { inviteCode } = req.body;^
    
    const group = await Group.findOne({ inviteCode });^
    
    if (!group) {^
      return res.status(404).json({ message: 'Invalid invite code' });^
    }^
    
    // Check if user is already a member^
    if (group.members.includes(req.user._id)) {^
      return res.status(400).json({ message: 'You are already a member of this group' });^
    }^
    
    // Add user to group members^
    group.members.push(req.user._id);^
    await group.save();^
    
    // Add group to user's groups^
    await User.findByIdAndUpdate(req.user._id, {^
      $push: { groups: group._id }^
    });^
    
    res.json(group);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Leave a group^
// @route   POST /api/groups/:id/leave^
// @access  Private^
router.post('/:id/leave', protect, async (req, res) =^> {^
  try {^
    const group = await Group.findById(req.params.id);^
    
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    
    // Check if user is a member^
    if (!group.members.includes(req.user._id)) {^
      return res.status(400).json({ message: 'You are not a member of this group' });^
    }^
    
    // Check if user is the creator^
    if (group.creator.toString() === req.user._id.toString()) {^
      return res.status(400).json({ message: 'Group creator cannot leave. Transfer ownership or delete the group.' });^
    }^
    
    // Remove user from group members^
    group.members = group.members.filter(member =^> member.toString() !== req.user._id.toString());^
    await group.save();^
    
    // Remove group from user's groups^
    await User.findByIdAndUpdate(req.user._id, {^
      $pull: { groups: group._id }^
    });^
    
    res.json({ message: 'Successfully left the group' });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Get all members of a group^
// @route   GET /api/groups/:id/members^
// @access  Private^
router.get('/:id/members', protect, async (req, res) =^> {^
  try {^
    const group = await Group.findById(req.params.id);^
    
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    
    // Check if user is a member^
    if (!group.members.includes(req.user._id)) {^
      return res.status(403).json({ message: 'Not authorized to view this group' });^
    }^
    
    // Get all members with details^
    const members = await User.find({^
      _id: { $in: group.members }^
    }).select('_id username avatar points');^
    
    res.json(members);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Generate new invite code for a group^
// @route   POST /api/groups/:id/invite-code^
// @access  Private^
router.post('/:id/invite-code', protect, async (req, res) =^> {^
  try {^
    const group = await Group.findById(req.params.id);^
    
    if (!group) {^
      return res.status(404).json({ message: 'Group not found' });^
    }^
    
    // Check if user is the creator^
    if (group.creator.toString() !== req.user._id.toString()) {^
      return res.status(403).json({ message: 'Not authorized to generate new invite code' });^
    }^
    
    // Generate new invite code^
    group.inviteCode = crypto.randomBytes(8).toString('hex');^
    await group.save();^
    
    res.json({ inviteCode: group.inviteCode });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
module.exports = router; > server\routes\group.routes.js

echo Creating user.routes.js
echo const express = require('express');^
const router = express.Router();^
const { protect } = require('../middleware/auth.middleware');^
const User = require('../models/User');^
^
// @desc    Get leaderboard^
// @route   GET /api/users/leaderboard^
// @access  Private^
router.get('/leaderboard', protect, async (req, res) =^> {^
  try {^
    const users = await User.find({})^
      .select('username avatar points')^
      .sort({ points: -1 })^
      .limit(50);^
    
    res.json(users);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Search users^
// @route   GET /api/users/search^
// @access  Private^
router.get('/search', protect, async (req, res) =^> {^
  try {^
    const { query } = req.query;^
    
    if (!query) {^
      return res.status(400).json({ message: 'Search query is required' });^
    }^
    
    const users = await User.find({^
      username: { $regex: query, $options: 'i' }^
    })^
      .select('username avatar')^
      .limit(10);^
    
    res.json(users);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Add friend^
// @route   POST /api/users/friends/:id^
// @access  Private^
router.post('/friends/:id', protect, async (req, res) =^> {^
  try {^
    if (req.params.id === req.user._id.toString()) {^
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });^
    }^
    
    const friend = await User.findById(req.params.id);^
    
    if (!friend) {^
      return res.status(404).json({ message: 'User not found' });^
    }^
    
    // Check if already friends^
    if (req.user.friends.includes(friend._id)) {^
      return res.status(400).json({ message: 'Already friends with this user' });^
    }^
    
    // Add friend to user's friends^
    await User.findByIdAndUpdate(req.user._id, {^
      $push: { friends: friend._id }^
    });^
    
    // Add user to friend's friends^
    await User.findByIdAndUpdate(friend._id, {^
      $push: { friends: req.user._id }^
    });^
    
    res.json({ message: 'Friend added successfully' });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Remove friend^
// @route   DELETE /api/users/friends/:id^
// @access  Private^
router.delete('/friends/:id', protect, async (req, res) =^> {^
  try {^
    const friend = await User.findById(req.params.id);^
    
    if (!friend) {^
      return res.status(404).json({ message: 'User not found' });^
    }^
    
    // Check if they are friends^
    if (!req.user.friends.includes(friend._id)) {^
      return res.status(400).json({ message: 'Not friends with this user' });^
    }^
    
    // Remove friend from user's friends^
    await User.findByIdAndUpdate(req.user._id, {^
      $pull: { friends: friend._id }^
    });^
    
    // Remove user from friend's friends^
    await User.findByIdAndUpdate(friend._id, {^
      $pull: { friends: req.user._id }^
    });^
    
    res.json({ message: 'Friend removed successfully' });^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
// @desc    Get friends list^
// @route   GET /api/users/friends^
// @access  Private^
router.get('/friends', protect, async (req, res) =^> {^
  try {^
    const user = await User.findById(req.user._id)^
      .populate('friends', 'username avatar');^
    
    res.json(user.friends);^
  } catch (error) {^
    res.status(500).json({ message: error.message });^
  }^
});^
^
module.exports = router; > server\routes\user.routes.js

echo Creating README.md
echo # Daily Prompt App^
^
A social app for friend groups to connect through daily prompts and anonymous guessing games.^
^
## Overview^
^
Daily Prompt is an interactive app that brings friends together through daily challenges. Each day, users receive a prompt (e.g., "What's your favorite type of cheese?" or "Share a picture of your feet"), and have one hour to answer. After the time expires, everyone tries to match each anonymous answer to the correct friend. Points are awarded for correct guesses, creating friendly competition within your group.^
^
## Features^
^
- **Daily Prompts**: Text and image-based questions to spark fun interactions^
- **Timed Responses**: 1-hour countdown for answering prompts^
- **Anonymous Answers**: All responses are anonymized during the guessing phase^
- **Guessing Game**: Match answers to your friends^
- **Points System**: Earn points for correct guesses^
- **Friend Groups**: Create and join multiple friend circles with private invites^
- **Leaderboard**: Track scores and rankings over time^
- **MongoDB Integration**: All user data, answers, and game states stored securely^
^
## Getting Started^
^
1. Clone the repository^
2. Install dependencies: `npm install`^
3. Create a `.env` file with MongoDB connection string and JWT secret^
4. Run the development server: `npm run dev`^
^
## License^
^
MIT > README.md

echo Creating final-setup.js
echo console.log('Setting up the Daily Prompt App...');^
^
console.log('All setup scripts have been run.');^
console.log('To start the application, run the following commands:');^
console.log('');^
console.log('npm install');^
console.log('npm run dev');^
console.log('');^
console.log('This will start both the React frontend and the Node.js backend.');^
console.log('The frontend will be available at: http://localhost:3000');^
console.log('The backend API will be available at: http://localhost:5000');^
^
console.log('');^
console.log('To use the application, you should:');^
console.log('1. Register an account');^
console.log('2. Create a group');^
console.log('3. Invite friends using the invite code');^
console.log('4. Create a prompt');^
console.log('5. Submit answers and guess who said what!');^
^
console.log('');^
console.log('Enjoy your Daily Prompt App!'); > final-setup.js

echo All routes created successfully.
echo Setup complete!
echo Run npm install and then npm run dev to start the application.
