// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Favicon route (MUST be before the wildcard route)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Utility functions
const recipesFilePath = path.join(__dirname, 'recipes.json');

function readRecipes() {
  try {
    const data = fs.readFileSync(recipesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeRecipes(recipes) {
  fs.writeFileSync(recipesFilePath, JSON.stringify(recipes, null, 2));
}

// API: Get all recipes
app.get('/api/recipes', (req, res) => {
  const recipes = readRecipes();
  res.json(recipes);
});

// API: Add a new recipe
app.post('/api/recipes', (req, res) => {
  const { name, ingredients, preparation, image } = req.body;
  if (!name || !ingredients || !preparation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const recipes = readRecipes();
  const exists = recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Recipe already exists' });
  }
  const newRecipe = { name, ingredients, preparation, image: image || '' };
  recipes.unshift(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

// API: Delete recipe by name
app.delete('/api/recipes/:name', (req, res) => {
  const recipeName = req.params.name.toLowerCase();
  let recipes = readRecipes();
  const initialLength = recipes.length;
  recipes = recipes.filter(r => r.name.toLowerCase() !== recipeName);
  if (recipes.length === initialLength) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  writeRecipes(recipes);
  res.json({ message: 'Recipe deleted' });
});

// Wildcard route for SPA support (keep at the end)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
