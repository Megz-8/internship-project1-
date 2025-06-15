const RECIPES_STORAGE_KEY = 'myRecipeBookRecipes_v1';

 //localStorage.removeItem(RECIPES_STORAGE_KEY);

function getStoredRecipes() {
  const storedRecipes = localStorage.getItem(RECIPES_STORAGE_KEY);
  if (storedRecipes) {
    try {
      const parsedRecipes = JSON.parse(storedRecipes);
      if (Array.isArray(parsedRecipes)) {
        return parsedRecipes;
      } else {
        console.warn("Stored recipes data is not an array. Removing corrupted storage.");
        localStorage.removeItem(RECIPES_STORAGE_KEY);
        return [];
      }
    } catch (e) {
      console.error("Error parsing recipes from localStorage:", e);
      localStorage.removeItem(RECIPES_STORAGE_KEY);
      return [];
    }
  }
  return [];
}

function saveRecipesToStorage() {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error("Error saving recipes to localStorage:", e);
    alert("Could not save recipes. Your browser storage might be full or an error occurred.");
  }
}

// Initialize recipes from storage ONLY
let recipes = getStoredRecipes();

// DOM elements
const container = document.getElementById('recipe-container');
const searchToggleBtn = document.getElementById('search-toggle-btn');
const recipeSearchTextarea = document.getElementById('recipe-search');
const ingredientsTextarea = document.getElementById('recipe-ingredients');

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';

  const flipInner = document.createElement('div');
  flipInner.className = 'flip-inner';

  const flipFront = document.createElement('div');
  flipFront.className = 'flip-front';

  const img = document.createElement('img');
  img.src = recipe.image;
  img.alt = recipe.title;

  const titleEl = document.createElement('h3');
  titleEl.className = 'title';
  titleEl.textContent = recipe.title;

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = recipe.description;

  flipFront.appendChild(img);
  flipFront.appendChild(titleEl);
  flipFront.appendChild(desc);

  const flipBack = document.createElement('div');
  flipBack.className = 'flip-back';

  const backTitle = document.createElement('h3');
  backTitle.textContent = "Ingredients";

  const ul = document.createElement('ul');
  recipe.ingredients.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    ul.appendChild(li);
  });

  flipBack.appendChild(backTitle);
  flipBack.appendChild(ul);

  const procTitle = document.createElement('h3');
  procTitle.textContent = "Procedure";

  const procText = document.createElement('div');
  procText.className = 'procedure';
  procText.textContent = recipe.procedure;

  flipBack.appendChild(procTitle);
  flipBack.appendChild(procText);

  const btnFav = document.createElement('button');
  btnFav.className = 'btn';
  btnFav.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
  btnFav.addEventListener('click', (evt) => {
    evt.stopPropagation();
    alert(`You favorited: ${recipe.title}`);
  });
  flipBack.appendChild(btnFav);

  flipInner.appendChild(flipFront);
  flipInner.appendChild(flipBack);
  card.appendChild(flipInner);

  card.addEventListener('click', () => {
    card.classList.toggle('flip');
  });

  return card;
}

function displayRecipes(list) {
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p style="text-align:center; font-size:1.3rem; color:#777;">No recipes found. Please add some!</p>';
    return;
  }
  list.forEach(recipe => {
    container.appendChild(createRecipeCard(recipe));
  });
}

displayRecipes(recipes);

searchToggleBtn.addEventListener('click', () => {
  if (recipeSearchTextarea.style.display === 'none' || recipeSearchTextarea.style.display === '') {
    recipeSearchTextarea.style.display = 'block';
    recipeSearchTextarea.focus();
  } else {
    recipeSearchTextarea.style.display = 'none';
    recipeSearchTextarea.value = '';
    displayRecipes(recipes);
  }
});

recipeSearchTextarea.addEventListener('input', () => {
  const searchTerm = recipeSearchTextarea.value.trim().toLowerCase();
  if (searchTerm === '') {
    displayRecipes(recipes);
    return;
  }
  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(searchTerm) ||
    r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
    r.procedure.toLowerCase().includes(searchTerm)
  );
  displayRecipes(filtered);
});

const addBtn = document.getElementById('add-recipe-btn');
addBtn.addEventListener('click', () => {
  const nameInput = document.getElementById('recipe-name');
  const imageInput = document.getElementById('recipe-image');
  const procedureInput = document.getElementById('recipe-procedure');

  const name = nameInput.value.trim();
  const imageUrl = imageInput.value.trim();
  const ingredientsRaw = ingredientsTextarea.value.trim();
  const procedure = procedureInput.value.trim();

  if (!name) {
    alert('Please enter the recipe name.');
    nameInput.focus();
    return;
  }
  if (!ingredientsRaw) {
    alert('Please enter at least one ingredient.');
    ingredientsTextarea.focus();
    return;
  }
  if (!procedure) {
    alert('Please enter the procedure.');
    procedureInput.focus();
    return;
  }

  const ingredients = ingredientsRaw.split('\n').map(i => i.trim()).filter(i => i.length > 0);
  const foodPhotos = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512058564366-c9ec8c9b7458?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"
  ];
  const imageToUse = imageUrl || foodPhotos[Math.floor(Math.random() * foodPhotos.length)];

  recipes.unshift({
    title: name,
    description: ingredients[0] ? (ingredients[0] + (ingredients.length > 1 ? '...' : '')) : "A delicious new recipe!",
    ingredients,
    procedure,
    image: imageToUse
  });

  saveRecipesToStorage();

  nameInput.value = '';
  imageInput.value = '';
  ingredientsTextarea.value = '';
  procedureInput.value = '';

  if (recipeSearchTextarea.style.display === 'block' || recipeSearchTextarea.value !== '') {
    recipeSearchTextarea.value = '';
    recipeSearchTextarea.style.display = 'none';
  }
  displayRecipes(recipes);
  alert(`Recipe "${name}" added!`);
});

// Update footer year
document.getElementById('current-year').textContent = new Date().getFullYear();
