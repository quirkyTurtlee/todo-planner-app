# GitHub Pages Deployment Guide

This guide will help you deploy your Todo Planner App to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Your project files (already set up)

## Step-by-Step Deployment Process

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository `todo-planner-app` (must match the base path in vite.config.js)
5. Make sure it's set to **Public** (GitHub Pages requires public repos for free accounts)
6. **Do NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 2. Connect Your Local Repository to GitHub

Run these commands in your terminal (in the project directory):

```bash
# Add the GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/todo-planner-app.git

# Rename the default branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. The deployment workflow will automatically trigger

### 4. Wait for Deployment

1. Go to the "Actions" tab in your repository
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually takes 2-3 minutes)
4. Once complete, your app will be available at: `https://YOUR_USERNAME.github.io/todo-planner-app/`

## Alternative Deployment Method (Manual)

If you prefer manual deployment, you can use the gh-pages package:

```bash
# Build and deploy manually
npm run deploy
```

This will build your app and push it to the `gh-pages` branch.

## Configuration Files Created

### 1. `.github/workflows/deploy.yml`
Automatic deployment workflow that:
- Triggers on pushes to main branch
- Installs dependencies
- Builds the project
- Deploys to GitHub Pages

### 2. `vite.config.js` (Updated)
Added `base: '/todo-planner-app/'` to ensure correct asset paths on GitHub Pages.

### 3. `package.json` (Updated)
Added deploy script and gh-pages dependency.

## Troubleshooting

### Common Issues:

1. **404 Error**: Make sure the repository name matches the base path in `vite.config.js`
2. **Assets not loading**: Verify the base path is correctly set
3. **Workflow fails**: Check that the repository is public and GitHub Pages is enabled

### Updating Your Deployment:

To update your deployed app:
1. Make changes to your code
2. Commit and push to the main branch:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. The GitHub Action will automatically redeploy your app

## Important Notes

- Your repository must be **public** for free GitHub Pages
- The first deployment may take a few extra minutes
- Changes to the main branch will automatically trigger redeployment
- The app will be available at: `https://YOUR_USERNAME.github.io/todo-planner-app/`

## Next Steps

After following this guide:
1. Create the GitHub repository
2. Push your code
3. Enable GitHub Pages
4. Wait for deployment
5. Share your live app URL!