@echo off
echo Setting up Daily Prompt App - This will create all files needed for the application.

REM Check if directory exists already
if exist daily-prompt-app (
  echo Error: daily-prompt-app directory already exists.
  echo Please remove or rename the existing directory before running this script.
  exit /b 1
)

REM Run the main setup script
call setup-script-main.bat

REM Run React setup script
call setup-script-react.bat

REM Run Services setup script (combined)
call setup-script-services-combined.bat

REM Run Game Components setup script
call setup-script-game-components.bat

REM Run Pages setup script (combined)
call setup-script-pages-combined.bat

REM Run Server setup script
call setup-script-server.bat

REM Run Controllers setup script (combined)
call setup-script-controllers-combined.bat

REM Run Routes setup script (combined)
call setup-script-routes-combined.bat

cd daily-prompt-app
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

node final-setup.js

echo Setup complete! Your Daily Prompt App is ready to use.
echo To get started:
echo 1. Run "cd daily-prompt-app"
echo 2. Run "npm install"
echo 3. Run "npm run dev"
echo.
echo This will start both the React frontend and Node.js backend servers.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
