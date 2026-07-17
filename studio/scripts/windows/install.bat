@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
set "HEIGE_EXIT=%ERRORLEVEL%"
if not "%HEIGE_EXIT%"=="0" pause
exit /b %HEIGE_EXIT%
