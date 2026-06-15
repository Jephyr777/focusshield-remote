@echo off
title FocusShield Remote Uploader
echo ===================================================
echo  FocusShield Remote GitHub Uploader
echo ===================================================
echo.

:: 1. Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git was not found in your system PATH!
    echo Please install Git first and try again.
    pause
    exit /b 1
)

:: 2. Initialize git repository
if not exist .git (
    echo [+] Initializing local Git repository...
    git init
    git branch -M main
)

:: 3. Create .gitignore
echo [+] Creating .gitignore file...
(
echo node_modules/
echo .next/
echo out/
echo build/
echo .env
echo .env.local
echo .env.production.local
echo .env.development.local
echo .env.test.local
echo .DS_Store
echo *.local
) > .gitignore

:: 4. Commit code
echo [+] Adding and committing files...
git add .
git commit -m "Initialize FocusShield Remote Control Web Console"

:: 5. Prompt for GitHub repo name
echo.
echo ---------------------------------------------------
echo Please enter the GitHub repository name you created
echo under https://github.com/Jephyr777 (e.g., focusshield-remote):
echo ---------------------------------------------------
set /p REPO_NAME="Repository Name: "

if "%REPO_NAME%"=="" (
    echo [ERROR] Repository name cannot be empty!
    pause
    exit /b 1
)

:: 6. Set remote URL
git remote remove origin >nul 2>nul
git remote add origin https://github.com/Jephyr777/%REPO_NAME%.git

echo.
echo [+] Remote URL set to: https://github.com/Jephyr777/%REPO_NAME%.git
echo [NOTICE] Next, GitHub authentication window will pop up.
echo Please login and authorize in your browser window.
echo.
pause

:: 7. Push code
git push -u origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Push failed!
    echo Please make sure you have created the PRIVATE repository
    echo named "%REPO_NAME%" on https://github.com/new first.
) else (
    echo.
    echo ===================================================
    echo  [SUCCESS] Code pushed to GitHub successfully!
    echo  View it at: https://github.com/Jephyr777/%REPO_NAME%
    echo ===================================================
)

pause
exit /b 0
