@echo off
call ./script/install.bat
start "" http://localhost:3000
node server.js
pause
