import React, { useState } from 'react';
import { INTERVIEW_CATEGORIES } from '../config/categories';
import { ValidationError } from '../types';
import './CategorySelection.css';

interface CategorySelectionProps {
  onCategorySelect: (categoryId: string) => void;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setError('');
  };

  const handleProceed = () => {
    if (!selectedCategory) {
      setError('Please select a category to continue');
      return;
    }
    onCategorySelect(selectedCategory);
  };

  return (
    <div className="category-selection" role="region" aria-label="Category selection">
      <div className="category-selection-header">
        <h1>Choose Your Interview Category</h1>
        <p>Select the type of interview you'd like to practice</p>
      </div>

      <div className="categories-grid" role="group" aria-label="Interview categories">
        {INTERVIEW_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick(category.id);
              }
            }}
            aria-pressed={selectedCategory === category.id}
            aria-label={`${category.name}: ${category.description}`}
          >
            <h3 className="category-name">{category.name}</h3>
            <p className="category-description">{category.description}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="category-selection-footer">
        <button
          className="proceed-button"
          onClick={handleProceed}
          disabled={!selectedCategory}
          aria-label={selectedCategory ? 'Start interview with selected category' : 'Select a category to start interview'}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};
