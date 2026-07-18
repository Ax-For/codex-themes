@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0restore.ps1" %*
set "CODEX_THEMES_EXIT=%ERRORLEVEL%"
if not "%CODEX_THEMES_EXIT%"=="0" pause
exit /b %CODEX_THEMES_EXIT%
