@echo off
echo Creating Daily Prompt App - Services...

cd daily-prompt-app

echo Creating api.js
echo import axios from 'axios';^
^
const API_URL = process.env.REACT_APP_API_URL ^|^| 'http://localhost:5000/api';^
^
const api = axios.create({^
  baseURL: API_URL,^
  headers: {^
    'Content-Type': 'application/json'^
  }^
});^
^
// Add a request interceptor to add the auth token to every request^
api.interceptors.request.use(^
  (config) =^> {^
    const token = localStorage.getItem('token');^
    if (token) {^
      config.headers.Authorization = `Bearer ${token}`;^
    }^
    return config;^
  },^
  (error) =^> Promise.reject(error)^
);^
^
// Add a response interceptor to handle token expiration^
api.interceptors.response.use(^
  (response) =^> response,^
  (error) =^> {^
    // Handle 401 Unauthorized errors by logging out the user^
    if (error.response ^&^& error.response.status === 401) {^
      localStorage.removeItem('token');^
      window.location.href = '/login';^
    }^
    return Promise.reject(error);^
  }^
);^
^
export default api; > src\services\api.js

echo Creating auth.service.js
echo import api from './api';^
^
export const authService = {^
  login: async (email, password) =^> {^
    const response = await api.post('/auth/login', { email, password });^
    if (response.data.token) {^
      localStorage.setItem('token', response.data.token);^
    }^
    return response.data;^
  },^
  ^
  register: async (username, email, password) =^> {^
    const response = await api.post('/auth/register', { username, email, password });^
    if (response.data.token) {^
      localStorage.setItem('token', response.data.token);^
    }^
    return response.data;^
  },^
  ^
  logout: () =^> {^
    localStorage.removeItem('token');^
  },^
  ^
  getCurrentUser: async () =^> {^
    const token = localStorage.getItem('token');^
    if (!token) {^
      return null;^
    }^
    ^
    try {^
      const response = await api.get('/auth/profile');^
      return response.data;^
    } catch (error) {^
      console.error('Failed to get current user', error);^
      localStorage.removeItem('token');^
      return null;^
    }^
  },^
  ^
  updateProfile: async (userData) =^> {^
    const response = await api.put('/auth/profile', userData);^
    return response.data;^
  }^
}; > src\services\auth.service.js

echo Creating game.service.js
echo import api from './api';^
^
export const gameService = {^
  // Get the current active game for a group^
  getCurrentGame: async (groupId) =^> {^
    const response = await api.get(`/games/current/${groupId}`);^
    return response.data;^
  },^
  ^
  // Get game by ID^
  getGameById: async (gameId) =^> {^
    const response = await api.get(`/games/${gameId}`);^
    return response.data;^
  },^
  ^
  // Submit an answer to a prompt^
  submitAnswer: async (promptId, content, contentType = 'text') =^> {^
    const response = await api.post('/answers', {^
      promptId,^
      content,^
      contentType^
    });^
    return response.data;^
  },^
  ^
  // Get all anonymized answers for a prompt during guessing phase^
  getAnswersForPrompt: async (promptId) =^> {^
    const response = await api.get(`/answers/prompt/${promptId}`);^
    return response.data;^
  },^
  ^
  // Start the guessing phase for a game^
  startGuessingPhase: async (gameId) =^> {^
    const response = await api.post(`/games/start-guessing/${gameId}`);^
    return response.data;^
  },^
  ^
  // Submit guesses for a game^
  submitGuesses: async (gameId, guesses) =^> {^
    const response = await api.post(`/games/submit-guesses/${gameId}`, { guesses });^
    return response.data;^
  },^
  ^
  // Get results for a completed game^
  getGameResults: async (gameId) =^> {^
    const response = await api.get(`/games/results/${gameId}`);^
    return response.data;^
  }^
}; > src\services\game.service.js

echo Creating group.service.js
echo import api from './api';^
^
export const groupService = {^
  // Get all groups the user is a member of^
  getUserGroups: async () =^> {^
    const response = await api.get('/groups/user');^
    return response.data;^
  },^
  ^
  // Get a specific group by ID^
  getGroupById: async (groupId) =^> {^
    const response = await api.get(`/groups/${groupId}`);^
    return response.data;^
  },^
  ^
  // Create a new group^
  createGroup: async (groupData) =^> {^
    const response = await api.post('/groups', groupData);^
    return response.data;^
  },^
  ^
  // Update a group^
  updateGroup: async (groupId, groupData) =^> {^
    const response = await api.put(`/groups/${groupId}`, groupData);^
    return response.data;^
  },^
  ^
  // Join a group using invite code^
  joinGroup: async (inviteCode) =^> {^
    const response = await api.post('/groups/join', { inviteCode });^
    return response.data;^
  },^
  ^
  // Leave a group^
  leaveGroup: async (groupId) =^> {^
    const response = await api.post(`/groups/${groupId}/leave`);^
    return response.data;^
  },^
  ^
  // Get all members of a group^
  getGroupMembers: async (groupId) =^> {^
    const response = await api.get(`/groups/${groupId}/members`);^
    return response.data;^
  },^
  ^
  // Generate a new invite code for a group^
  generateInviteCode: async (groupId) =^> {^
    const response = await api.post(`/groups/${groupId}/invite-code`);^
    return response.data;^
  }^
}; > src\services\group.service.js

echo Creating prompt.service.js
echo import api from './api';^
^
export const promptService = {^
  // Create a new prompt for a group^
  createPrompt: async (promptData) =^> {^
    const response = await api.post('/prompts', promptData);^
    return response.data;^
  },^
  ^
  // Get active prompt for a group^
  getActivePrompt: async (groupId) =^> {^
    try {^
      const response = await api.get(`/prompts/active/${groupId}`);^
      return response.data;^
    } catch (error) {^
      if (error.response ^&^& error.response.status === 404) {^
        return null; // No active prompt^
      }^
      throw error;^
    }^
  },^
  ^
  // Get all prompts for a group^
  getAllPrompts: async (groupId) =^> {^
    const response = await api.get(`/prompts/group/${groupId}`);^
    return response.data;^
  }^
}; > src\services\prompt.service.js

echo Creating utils.js
echo // Format time in seconds to HH:MM:SS format^
export const formatTime = (seconds) =^> {^
  const hours = Math.floor(seconds / 3600);^
  const minutes = Math.floor((seconds % 3600) / 60);^
  const secs = Math.floor(seconds % 60);^
  ^
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;^
};^
^
// Generate a random prompt for testing^
export const generateRandomPrompt = () =^> {^
  const prompts = [^
    "What's your favorite type of cheese?",^
    "If you were a kitchen utensil, what would you be and why?",^
    "Share a picture of your feet",^
    "What's the strangest dream you've had recently?",^
    "If you could have dinner with any historical figure, who would it be?",^
    "What's your most unpopular opinion?",^
    "Share a picture of what's in your fridge right now",^
    "What's your go-to karaoke song?",^
    "If you had to eat one food for the rest of your life, what would it be?",^
    "What's your most embarrassing childhood memory?"^
  ];^
  ^
  return prompts[Math.floor(Math.random() * prompts.length)];^
};^
^
// Validate email format^
export const validateEmail = (email) =^> {^
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;^
  return re.test(String(email).toLowerCase());^
};^
^
// Get user initials for avatar^
export const getUserInitials = (name) =^> {^
  if (!name) return '';^
  ^
  const names = name.split(' ');^
  if (names.length === 1) {^
    return names[0].charAt(0).toUpperCase();^
  }^
  ^
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();^
}; > src\utils\formatters.js

echo Services and utilities created.
echo Run 4-setup-game-components.bat next.
