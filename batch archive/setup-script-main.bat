@echo off
echo Creating Daily Prompt App - Main Setup...

REM Create project directory
mkdir daily-prompt-app
cd daily-prompt-app

REM Initialize npm project
echo Creating package.json
echo {^
  "name": "daily-prompt-app",^
  "version": "0.1.0",^
  "private": true,^
  "dependencies": {^
    "@testing-library/jest-dom": "^5.16.5",^
    "@testing-library/react": "^13.4.0",^
    "@testing-library/user-event": "^13.5.0",^
    "axios": "^1.3.4",^
    "bcryptjs": "^2.4.3",^
    "cors": "^2.8.5",^
    "dotenv": "^16.0.3",^
    "express": "^4.18.2",^
    "jsonwebtoken": "^9.0.0",^
    "lucide-react": "^0.125.0",^
    "mongoose": "^7.0.3",^
    "react": "^18.2.0",^
    "react-dom": "^18.2.0",^
    "react-router-dom": "^6.9.0",^
    "react-scripts": "5.0.1",^
    "web-vitals": "^2.1.4"^
  },^
  "scripts": {^
    "start": "react-scripts start",^
    "build": "react-scripts build",^
    "test": "react-scripts test",^
    "eject": "react-scripts eject",^
    "server": "nodemon server/server.js",^
    "client": "npm start",^
    "dev": "concurrently \"npm run server\" \"npm run client\""^
  },^
  "eslintConfig": {^
    "extends": [^
      "react-app",^
      "react-app/jest"^
    ]^
  },^
  "browserslist": {^
    "production": [^
      "^>0.2^%",^
      "not dead",^
      "not op_mini all"^
    ],^
    "development": [^
      "last 1 chrome version",^
      "last 1 firefox version",^
      "last 1 safari version"^
    ]^
  },^
  "devDependencies": {^
    "concurrently": "^7.6.0",^
    "nodemon": "^2.0.22",^
    "tailwindcss": "^3.3.0"^
  },^
  "proxy": "http://localhost:5000"^
} > package.json

REM Create .env file
echo Creating .env file
echo PORT=5000> .env
echo MONGO_URI=mongodb://localhost:27017/daily-prompt-app>> .env
echo JWT_SECRET=your_jwt_secret_key>> .env
echo NODE_ENV=development>> .env

REM Create React public directory structure
mkdir public
echo Creating basic HTML file
echo ^<!DOCTYPE html^>^
^<html lang="en"^>^
  ^<head^>^
    ^<meta charset="utf-8" /^>^
    ^<link rel="icon" href="%PUBLIC_URL%/favicon.ico" /^>^
    ^<meta name="viewport" content="width=device-width, initial-scale=1" /^>^
    ^<meta name="theme-color" content="#000000" /^>^
    ^<meta name="description" content="Daily Prompt App for friends" /^>^
    ^<link rel="manifest" href="%PUBLIC_URL%/manifest.json" /^>^
    ^<title^>Daily Prompt App^</title^>^
  ^</head^>^
  ^<body^>^
    ^<noscript^>You need to enable JavaScript to run this app.^</noscript^>^
    ^<div id="root"^>^</div^>^
  ^</body^>^
^</html^> > public\index.html

REM Create src directory structure
mkdir src
mkdir src\components
mkdir src\components\Auth
mkdir src\components\Game
mkdir src\components\Layout
mkdir src\components\UI
mkdir src\pages
mkdir src\services
mkdir src\utils

REM Create server directory structure
mkdir server
mkdir server\models
mkdir server\routes
mkdir server\controllers
mkdir server\middleware
mkdir server\config
mkdir server\utils

echo Directory structure created.
echo Run 2-setup-react.bat next.
