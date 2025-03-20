@echo off
echo Creating Daily Prompt App - Server Files...

cd daily-prompt-app

REM Create the main server.js file
echo Creating server.js
echo const express = require('express');^
const cors = require('cors');^
const dotenv = require('dotenv');^
const connectDB = require('./server/config/db.config');^
const path = require('path');^
^
// Load environment variables^
dotenv.config();^
^
// Connect to database^
connectDB();^
^
const app = express();^
^
// Middleware^
app.use(cors());^
app.use(express.json({ limit: '50mb' }));^
app.use(express.urlencoded({ limit: '50mb', extended: true }));^
^
// API Routes^
app.use('/api/auth', require('./server/routes/auth.routes'));^
app.use('/api/prompts', require('./server/routes/prompt.routes'));^
app.use('/api/answers', require('./server/routes/answer.routes'));^
app.use('/api/games', require('./server/routes/game.routes'));^
app.use('/api/groups', require('./server/routes/group.routes'));^
app.use('/api/users', require('./server/routes/user.routes'));^
^
// Serve static assets in production^
if (process.env.NODE_ENV === 'production') {^
  app.use(express.static(path.join(__dirname, 'build')));^
  ^
  app.get('*', (req, res) =^> {^
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));^
  });^
}^
^
const PORT = process.env.PORT ^|^| 5000;^
^
app.listen(PORT, () =^> console.log(`Server running on port ${PORT}`)); > server.js

echo Creating DB config
echo const mongoose = require('mongoose');^
^
const connectDB = async () =^> {^
  try {^
    const conn = await mongoose.connect(process.env.MONGO_URI, {^
      useNewUrlParser: true,^
      useUnifiedTopology: true,^
    });^
    ^
    console.log(`MongoDB Connected: ${conn.connection.host}`);^
  } catch (error) {^
    console.error(`Error: ${error.message}`);^
    process.exit(1);^
  }^
};^
^
module.exports = connectDB; > server\config\db.config.js

echo Creating MongoDB Models
echo const mongoose = require('mongoose');^
const bcrypt = require('bcryptjs');^
^
const UserSchema = new mongoose.Schema({^
  username: {^
    type: String,^
    required: true,^
    unique: true,^
    trim: true,^
    minlength: 3^
  },^
  email: {^
    type: String,^
    required: true,^
    unique: true,^
    trim: true,^
    lowercase: true^
  },^
  password: {^
    type: String,^
    required: true,^
    minlength: 6^
  },^
  avatar: {^
    type: String,^
    default: ''^
  },^
  points: {^
    type: Number,^
    default: 0^
  },^
  friends: [{^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User'^
  }],^
  groups: [{^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Group'^
  }]^
}, {^
  timestamps: true^
});^
^
// Hash password before saving^
UserSchema.pre('save', async function(next) {^
  if (!this.isModified('password')) return next();^
  ^
  try {^
    const salt = await bcrypt.genSalt(10);^
    this.password = await bcrypt.hash(this.password, salt);^
    next();^
  } catch (error) {^
    next(error);^
  }^
});^
^
// Method to compare passwords^
UserSchema.methods.matchPassword = async function(enteredPassword) {^
  return await bcrypt.compare(enteredPassword, this.password);^
};^
^
module.exports = mongoose.model('User', UserSchema); > server\models\User.js

echo Creating Group model
echo const mongoose = require('mongoose');^
^
const GroupSchema = new mongoose.Schema({^
  name: {^
    type: String,^
    required: true,^
    trim: true^
  },^
  description: {^
    type: String,^
    default: ''^
  },^
  creator: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User',^
    required: true^
  },^
  members: [{^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User'^
  }],^
  isPrivate: {^
    type: Boolean,^
    default: false^
  },^
  inviteCode: {^
    type: String,^
    unique: true^
  }^
}, {^
  timestamps: true^
});^
^
module.exports = mongoose.model('Group', GroupSchema); > server\models\Group.js

echo Creating Prompt model
echo const mongoose = require('mongoose');^
^
const PromptSchema = new mongoose.Schema({^
  text: {^
    type: String,^
    required: true,^
    trim: true^
  },^
  type: {^
    type: String,^
    enum: ['text', 'image'],^
    default: 'text'^
  },^
  group: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Group',^
    required: true^
  },^
  createdBy: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User'^
  },^
  isActive: {^
    type: Boolean,^
    default: true^
  },^
  expiresAt: {^
    type: Date,^
    required: true^
  }^
}, {^
  timestamps: true^
});^
^
module.exports = mongoose.model('Prompt', PromptSchema); > server\models\Prompt.js

echo Creating Answer model
echo const mongoose = require('mongoose');^
^
const AnswerSchema = new mongoose.Schema({^
  prompt: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Prompt',^
    required: true^
  },^
  user: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User',^
    required: true^
  },^
  content: {^
    type: String,^
    required: true^
  },^
  contentType: {^
    type: String,^
    enum: ['text', 'image'],^
    default: 'text'^
  }^
}, {^
  timestamps: true^
});^
^
module.exports = mongoose.model('Answer', AnswerSchema); > server\models\Answer.js

echo Creating Game model
echo const mongoose = require('mongoose');^
^
const GuessSchema = new mongoose.Schema({^
  guesser: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User',^
    required: true^
  },^
  answerId: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Answer',^
    required: true^
  },^
  guessedUser: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'User',^
    required: true^
  },^
  isCorrect: {^
    type: Boolean,^
    default: false^
  }^
});^
^
const GameSchema = new mongoose.Schema({^
  prompt: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Prompt',^
    required: true^
  },^
  group: {^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Group',^
    required: true^
  },^
  status: {^
    type: String,^
    enum: ['active', 'guessing', 'completed'],^
    default: 'active'^
  },^
  startTime: {^
    type: Date,^
    default: Date.now^
  },^
  endTime: {^
    type: Date^
  },^
  guessPhaseStartTime: {^
    type: Date^
  },^
  guessPhaseEndTime: {^
    type: Date^
  },^
  answers: [{^
    type: mongoose.Schema.Types.ObjectId,^
    ref: 'Answer'^
  }],^
  guesses: [GuessSchema],^
  results: [{^
    user: {^
      type: mongoose.Schema.Types.ObjectId,^
      ref: 'User'^
    },^
    pointsEarned: {^
      type: Number,^
      default: 0^
    },^
    correctGuesses: {^
      type: Number,^
      default: 0^
    }^
  }]^
}, {^
  timestamps: true^
});^
^
module.exports = mongoose.model('Game', GameSchema); > server\models\Game.js

echo Creating Auth middleware
echo const jwt = require('jsonwebtoken');^
const User = require('../models/User');^
^
const protect = async (req, res, next) =^> {^
  let token;^
  ^
  if (req.headers.authorization ^&^& req.headers.authorization.startsWith('Bearer')) {^
    try {^
      // Get token from header^
      token = req.headers.authorization.split(' ')[1];^
      ^
      // Verify token^
      const decoded = jwt.verify(token, process.env.JWT_SECRET);^
      ^
      // Get user from the token^
      req.user = await User.findById(decoded.id).select('-password');^
      ^
      next();^
    } catch (error) {^
      console.error(error);^
      res.status(401);^
      throw new Error('Not authorized, token failed');^
    }^
  }^
  ^
  if (!token) {^
    res.status(401);^
    throw new Error('Not authorized, no token');^
  }^
};^
^
module.exports = { protect }; > server\middleware\auth.middleware.js

echo Creating Error middleware
echo const errorHandler = (err, req, res, next) =^> {^
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;^
  ^
  res.status(statusCode);^
  res.json({^
    message: err.message,^
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,^
  });^
};^
^
module.exports = { errorHandler }; > server\middleware\error.middleware.js

echo Server structure created.
echo Run 7-setup-controllers.bat next.
