import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { BuiltForLife } from './components/BuiltForLife';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { CtaBanner } from './components/CtaBanner';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { RECIPES, Recipe } from './data/recipes';
import { Search, ChevronDown, X, RotateCcw, Bookmark, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'recipes' | 'about'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrepTime, setMaxPrepTime] = useState<number | 'all'>('all');
  const [maxCookTime, setCookTimeFilter] = useState<number | 'all'>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Saved / Favorite recipes persistence in localStorage
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hrf_saved_recipes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hrf_saved_recipes', JSON.stringify(savedRecipeIds));
    } catch (e) {
      console.warn('Unable to persist saved recipes', e);
    }
  }, [savedRecipeIds]);

  const toggleSaveRecipe = (recipeId: string) => {
    setSavedRecipeIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleNavigate = (tab: 'home' | 'recipes' | 'about') => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'recipes') {
      const el = document.getElementById('recipes-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'about') {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMaxPrepTime('all');
    setCookTimeFilter('all');
    setSelectedDietary('all');
    setShowSavedOnly(false);
  };

  // Filter logic
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((recipe) => {
      // 1. Saved filter
      if (showSavedOnly && !savedRecipeIds.includes(recipe.id)) {
        return false;
      }

      // 2. Prep time filter
      if (maxPrepTime !== 'all' && recipe.prepTime > maxPrepTime) {
        return false;
      }

      // 3. Cook time filter
      if (maxCookTime !== 'all' && recipe.cookTime > maxCookTime) {
        return false;
      }

      // 4. Dietary tag filter
      if (selectedDietary !== 'all' && !recipe.dietary.includes(selectedDietary)) {
        return false;
      }

      // 5. Search query (matches title, description, and ingredients)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = recipe.title.toLowerCase().includes(query);
        const descMatch = recipe.description.toLowerCase().includes(query);
        const ingredientMatch = recipe.ingredients.some((ing) =>
          ing.item.toLowerCase().includes(query)
        );
        const dietaryMatch = recipe.dietary.some((d) =>
          d.toLowerCase().includes(query)
        );
        if (!titleMatch && !descMatch && !ingredientMatch && !dietaryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, maxPrepTime, maxCookTime, selectedDietary, showSavedOnly, savedRecipeIds]);

  const hasActiveFilters =
    searchQuery !== '' ||
    maxPrepTime !== 'all' ||
    maxCookTime !== 'all' ||
    selectedDietary !== 'all' ||
    showSavedOnly;

  return (
    <div className="site-wrapper">
      {/* 1. Header & Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        savedCount={savedRecipeIds.length}
        onOpenSaved={() => {
          setShowSavedOnly(true);
          const el = document.getElementById('recipes-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onStartExploring={() => {
            const el = document.getElementById('recipes-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. "What you'll get" Section */}
        <Features />

        {/* 4. "Built for real life" Section */}
        <BuiltForLife />

        {/* 5. Recipes Catalog Section (Core Feature matching Image 2) */}
        <section className="recipes-catalog-section" id="recipes-catalog">
          <div className="container-custom">
            <div className="recipes-header-text">
              <h2 className="recipes-headline">
                Explore our simple, healthy recipes
              </h2>
              <p className="recipes-subtext">
                Discover eight quick, whole-food dishes that fit real-life schedules
                and taste amazing. Use the search bar to find a recipe by name or
                ingredient, or simply scroll the list and let something delicious catch
                your eye.
              </p>
            </div>

            {/* Interactive Filter Bar matching the screenshot */}
            <div className="filter-bar">
              <div className="filter-controls-row">
                {/* Max Prep Time Dropdown */}
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={maxPrepTime}
                    onChange={(e) =>
                      setMaxPrepTime(
                        e.target.value === 'all'
                          ? 'all'
                          : parseInt(e.target.value, 10)
                      )
                    }
                    aria-label="Filter by maximum preparation time"
                  >
                    <option value="all">Max Prep Time</option>
                    <option value={5}>Prep: ≤ 5 mins</option>
                    <option value={10}>Prep: ≤ 10 mins</option>
                  </select>
                  <ChevronDown className="select-arrow" aria-hidden="true" />
                </div>

                {/* Max Cook Time Dropdown */}
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={maxCookTime}
                    onChange={(e) =>
                      setCookTimeFilter(
                        e.target.value === 'all'
                          ? 'all'
                          : parseInt(e.target.value, 10)
                      )
                    }
                    aria-label="Filter by maximum cooking time"
                  >
                    <option value="all">Max Cook Time</option>
                    <option value={0}>No cook (0 min)</option>
                    <option value={5}>Cook: ≤ 5 mins</option>
                    <option value={10}>Cook: ≤ 10 mins</option>
                    <option value={15}>Cook: ≤ 15 mins</option>
                    <option value={20}>Cook: ≤ 20 mins</option>
                  </select>
                  <ChevronDown className="select-arrow" aria-hidden="true" />
                </div>

                {/* Search by name or ingredient input */}
                <div className="search-input-wrapper">
                  <Search className="search-input-icon" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or ingredient..."
                    className="search-input"
                    aria-label="Search recipes by name or ingredient"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="search-clear-btn"
                      aria-label="Clear search query"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dietary Tags & Saved Filter Chips */}
              <div className="filter-chips-row">
                <div className="chips-list">
                  <button
                    onClick={() => {
                      setSelectedDietary('all');
                      setShowSavedOnly(false);
                    }}
                    className={`filter-chip-btn ${
                      selectedDietary === 'all' && !showSavedOnly ? 'active' : ''
                    }`}
                  >
                    All Recipes ({RECIPES.length})
                  </button>
                  <button
                    onClick={() => setSelectedDietary('Vegetarian')}
                    className={`filter-chip-btn ${
                      selectedDietary === 'Vegetarian' && !showSavedOnly
                        ? 'active'
                        : ''
                    }`}
                  >
                    Vegetarian
                  </button>
                  <button
                    onClick={() => setSelectedDietary('Vegan')}
                    className={`filter-chip-btn ${
                      selectedDietary === 'Vegan' && !showSavedOnly ? 'active' : ''
                    }`}
                  >
                    Vegan
                  </button>
                  <button
                    onClick={() => setSelectedDietary('Gluten-Free')}
                    className={`filter-chip-btn ${
                      selectedDietary === 'Gluten-Free' && !showSavedOnly
                        ? 'active'
                        : ''
                    }`}
                  >
                    Gluten-Free
                  </button>
                  <button
                    onClick={() => setSelectedDietary('High-Protein')}
                    className={`filter-chip-btn ${
                      selectedDietary === 'High-Protein' && !showSavedOnly
                        ? 'active'
                        : ''
                    }`}
                  >
                    High-Protein
                  </button>
                  <button
                    onClick={() => setShowSavedOnly(!showSavedOnly)}
                    className={`filter-chip-btn ${showSavedOnly ? 'active' : ''}`}
                  >
                    ❤️ Saved ({savedRecipeIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="results-meta-count">
                    Showing {filteredRecipes.length} of {RECIPES.length} recipes
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 underline underline-offset-2"
                      title="Reset all filters"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recipe Cards Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="recipes-grid">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(rec) => setSelectedRecipe(rec)}
                    isSaved={savedRecipeIds.includes(recipe.id)}
                    onToggleSave={toggleSaveRecipe}
                  />
                ))}
              </div>
            ) : (
              /* Helpful Empty State */
              <div className="empty-state">
                <div className="text-4xl mb-2">🥗</div>
                <h3>No matching recipes found</h3>
                <p>
                  We couldn't find any recipes matching your current filters or
                  search terms. Try loosening your prep/cook time or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-header-cta"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 6. "Ready to cook smarter?" Callout Banner */}
        <CtaBanner
          onExplore={() => {
            const el = document.getElementById('recipes-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 7. About Section */}
        <AboutSection />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* 9. Interactive Full Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isSaved={selectedRecipe ? savedRecipeIds.includes(selectedRecipe.id) : false}
        onToggleSave={toggleSaveRecipe}
      />
    </div>
  );
}
