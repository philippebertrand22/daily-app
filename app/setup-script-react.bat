@echo off
echo Creating Daily Prompt App - React Files...

cd daily-prompt-app

REM Create App.js
echo Creating App.js
echo import React from 'react';^
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';^
import { AuthProvider } from './components/Auth/AuthContext';^
import ProtectedRoute from './components/Auth/ProtectedRoute';^
import HomePage from './pages/HomePage';^
import LoginPage from './pages/LoginPage';^
import RegisterPage from './pages/RegisterPage';^
import GamePage from './pages/GamePage';^
import LeaderboardPage from './pages/LeaderboardPage';^
import ProfilePage from './pages/ProfilePage';^
import GroupsPage from './pages/GroupsPage';^
import GroupDetailPage from './pages/GroupDetailPage';^
import CreateGroupPage from './pages/CreateGroupPage';^
import './App.css';^
^
function App() {^
  return (^
    ^<AuthProvider^>^
      ^<Router^>^
        ^<Routes^>^
          ^<Route path="/login" element={^<LoginPage /^>} /^>^
          ^<Route path="/register" element={^<RegisterPage /^>} /^>^
          ^<Route ^
            path="/" ^
            element={^
              ^<ProtectedRoute^>^
                ^<HomePage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/game/:gameId" ^
            element={^
              ^<ProtectedRoute^>^
                ^<GamePage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/leaderboard" ^
            element={^
              ^<ProtectedRoute^>^
                ^<LeaderboardPage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/profile" ^
            element={^
              ^<ProtectedRoute^>^
                ^<ProfilePage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/groups" ^
            element={^
              ^<ProtectedRoute^>^
                ^<GroupsPage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/groups/create" ^
            element={^
              ^<ProtectedRoute^>^
                ^<CreateGroupPage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
          ^<Route ^
            path="/groups/:groupId" ^
            element={^
              ^<ProtectedRoute^>^
                ^<GroupDetailPage /^>^
              ^</ProtectedRoute^>^
            } ^
          /^>^
        ^</Routes^>^
      ^</Router^>^
    ^</AuthProvider^>^
  );^
}^
^
export default App; > src\App.js

REM Create index.js
echo Creating index.js
echo import React from 'react';^
import ReactDOM from 'react-dom/client';^
import './index.css';^
import App from './App';^
^
const root = ReactDOM.createRoot(document.getElementById('root'));^
root.render(^
  ^<React.StrictMode^>^
    ^<App /^>^
  ^</React.StrictMode^>^
); > src\index.js

REM Create basic CSS files
echo Creating CSS files
echo body {^
  margin: 0;^
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',^
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',^
    sans-serif;^
  -webkit-font-smoothing: antialiased;^
  -moz-osx-font-smoothing: grayscale;^
}^
^
code {^
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',^
    monospace;^
} > src\index.css

echo .App {^
  text-align: center;^
}^
^
.container {^
  max-width: 1200px;^
  margin: 0 auto;^
  padding: 0 15px;^
} > src\App.css

REM Create Auth components
echo Creating AuthContext.js
echo import React, { createContext, useState, useEffect } from 'react';^
import { authService } from '../../services/auth.service';^
^
export const AuthContext = createContext();^
^
export const AuthProvider = ({ children }) =^> {^
  const [user, setUser] = useState(null);^
  const [loading, setLoading] = useState(true);^
^
  useEffect(() =^> {^
    // Check if user is logged in^
    const loadUser = async () =^> {^
      setLoading(true);^
      try {^
        const userData = await authService.getCurrentUser();^
        if (userData) {^
          setUser(userData);^
        }^
      } catch (error) {^
        console.error('Failed to load user', error);^
        localStorage.removeItem('token');^
        setUser(null);^
      }^
      setLoading(false);^
    };^
^
    loadUser();^
  }, []);^
^
  const login = async (email, password) =^> {^
    try {^
      const data = await authService.login(email, password);^
      setUser(data);^
      return data;^
    } catch (error) {^
      throw error;^
    }^
  };^
^
  const register = async (username, email, password) =^> {^
    try {^
      const data = await authService.register(username, email, password);^
      setUser(data);^
      return data;^
    } catch (error) {^
      throw error;^
    }^
  };^
^
  const logout = () =^> {^
    authService.logout();^
    setUser(null);^
  };^
^
  const updateProfile = async (userData) =^> {^
    try {^
      const updatedUser = await authService.updateProfile(userData);^
      setUser(updatedUser);^
      return updatedUser;^
    } catch (error) {^
      throw error;^
    }^
  };^
^
  return (^
    ^<AuthContext.Provider^
      value={{^
        user,^
        loading,^
        login,^
        register,^
        logout,^
        updateProfile^
      }}^
    ^>^
      {children}^
    ^</AuthContext.Provider^>^
  );^
}; > src\components\Auth\AuthContext.js

echo Creating ProtectedRoute.js
echo import React, { useContext } from 'react';^
import { Navigate } from 'react-router-dom';^
import { AuthContext } from './AuthContext';^
^
const ProtectedRoute = ({ children }) =^> {^
  const { user, loading } = useContext(AuthContext);^
^
  if (loading) {^
    return ^<div className="loading"^>Loading...^</div^>;^
  }^
^
  if (!user) {^
    return ^<Navigate to="/login" /^>;^
  }^
^
  return children;^
};^
^
export default ProtectedRoute; > src\components\Auth\ProtectedRoute.js

REM Create UI components
echo Creating Button.js
echo import React from 'react';^
^
const Button = ({ ^
  children, ^
  onClick, ^
  type = 'button', ^
  color = 'primary', ^
  fullWidth = false,^
  disabled = false,^
  loading = false^
}) =^> {^
  const baseClasses = 'px-4 py-2 rounded-lg font-medium focus:outline-none transition-colors';^
  const colorClasses = {^
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',^
    secondary: 'bg-purple-500 hover:bg-purple-600 text-white',^
    success: 'bg-green-500 hover:bg-green-600 text-white',^
    danger: 'bg-red-500 hover:bg-red-600 text-white',^
    gray: 'bg-gray-200 hover:bg-gray-300 text-gray-800'^
  };^
  const widthClass = fullWidth ? 'w-full' : '';^
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';^
  ^
  return (^
    ^<button^
      type={type}^
      onClick={onClick}^
      disabled={disabled ^|^| loading}^
      className={`${baseClasses} ${colorClasses[color]} ${widthClass} ${disabledClass} flex justify-center items-center`}^
    ^>^
      {loading ? (^
        ^<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"^>^
          ^<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"^>^</circle^>^
          ^<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"^>^</path^>^
        ^</svg^>^
      ) : null}^
      {children}^
    ^</button^>^
  );^
};^
^
export default Button; > src\components\UI\Button.js

echo Creating Card.js
echo import React from 'react';^
^
const Card = ({ children, className = '' }) =^> {^
  return (^
    ^<div className={`bg-white rounded-lg shadow-md p-6 ${className}`}^>^
      {children}^
    ^</div^>^
  );^
};^
^
export default Card; > src\components\UI\Card.js

echo Creating Timer.js
echo import React, { useState, useEffect } from 'react';^
import { Clock } from 'lucide-react';^
^
const Timer = ({ timeRemaining }) =^> {^
  const [time, setTime] = useState(timeRemaining);^
^
  useEffect(() =^> {^
    const timer = setInterval(() =^> {^
      setTime(prevTime =^> {^
        if (prevTime ^<= 0) {^
          clearInterval(timer);^
          return 0;^
        }^
        return prevTime - 1;^
      });^
    }, 1000);^
^
    return () =^> clearInterval(timer);^
  }, []);^
^
  const formatTime = () =^> {^
    const hours = Math.floor(time / 3600);^
    const minutes = Math.floor((time % 3600) / 60);^
    const seconds = Math.floor(time % 60);^
^
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;^
  };^
^
  return (^
    ^<div className="flex justify-center items-center mb-4"^>^
      ^<Clock className="mr-2 text-blue-500" size={20} /^>^
      ^<span className="font-mono"^>{formatTime()}^</span^>^
    ^</div^>^
  );^
};^
^
export default Timer; > src\components\UI\Timer.js

REM Create Layout components
echo Creating Navbar.js
echo import React, { useContext } from 'react';^
import { Link, useNavigate } from 'react-router-dom';^
import { AuthContext } from '../Auth/AuthContext';^
import { Bell, User, LogOut } from 'lucide-react';^
^
const Navbar = () =^> {^
  const { user, logout } = useContext(AuthContext);^
  const navigate = useNavigate();^
^
  const handleLogout = () =^> {^
    logout();^
    navigate('/login');^
  };^
^
  return (^
    ^<nav className="bg-white shadow-md"^>^
      ^<div className="container mx-auto px-4 py-3"^>^
        ^<div className="flex justify-between items-center"^>^
          ^<Link to="/" className="text-xl font-bold text-blue-500"^>Daily Prompt^</Link^>^
^
          {user ? (^
            ^<div className="flex items-center"^>^
              ^<Link to="/" className="px-3 py-2 rounded hover:bg-gray-100 mr-2"^>^
                ^<Bell size={20} /^>^
              ^</Link^>^
^
              ^<div className="relative group"^>^
                ^<button className="flex items-center px-3 py-2 rounded hover:bg-gray-100"^>^
                  {user.avatar ? (^
                    ^<img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full mr-2" /^>^
                  ) : (^
                    ^<User size={20} className="mr-2" /^>^
                  )}^
                  ^<span^>{user.username}^</span^>^
                ^</button^>^
^
                ^<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 hidden group-hover:block"^>^
                  ^<Link to="/profile" className="block px-4 py-2 hover:bg-gray-100"^>Profile^</Link^>^
                  ^<Link to="/groups" className="block px-4 py-2 hover:bg-gray-100"^>Groups^</Link^>^
                  ^<Link to="/leaderboard" className="block px-4 py-2 hover:bg-gray-100"^>Leaderboard^</Link^>^
                  ^<button ^
                    onClick={handleLogout}^
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"^
                  ^>^
                    ^<LogOut size={16} className="inline mr-2" /^>^
                    Logout^
                  ^</button^>^
                ^</div^>^
              ^</div^>^
            ^</div^>^
          ) : (^
            ^<div^>^
              ^<Link to="/login" className="px-4 py-2 mr-2"^>Login^</Link^>^
              ^<Link ^
                to="/register"^
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"^
              ^>^
                Register^
              ^</Link^>^
            ^</div^>^
          )}^
        ^</div^>^
      ^</div^>^
    ^</nav^>^
  );^
};^
^
export default Navbar; > src\components\Layout\Navbar.js

echo React basic components created.
echo Run 3-setup-services.bat next.
