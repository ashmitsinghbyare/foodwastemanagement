#!/bin/bash

# Script to prepare project for GitHub upload

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
fi

# Check if git user is configured
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
  echo "Setting up git user (replace with your own details)..."
  git config user.name "Your Name"
  git config user.email "your.email@example.com"
  echo "Please update git user details with your own using:"
  echo "git config user.name 'Your Name'"
  echo "git config user.email 'your.email@example.com'"
fi

# Add all files except those in .gitignore
echo "Adding files to git..."
git add .

# Make initial commit if no commits exist
if [ -z "$(git log -1 2>/dev/null)" ]; then
  echo "Making initial commit..."
  git commit -m "Initial commit: Food Waste Management System"
fi

echo ""
echo "Your project is now ready for GitHub upload."
echo "To push to GitHub, create a repository on GitHub and run:"
echo "git remote add origin https://github.com/yourusername/food-waste-management.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Replace 'yourusername' with your actual GitHub username."
