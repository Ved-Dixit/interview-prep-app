import * as fc from 'fast-check';
import {
  INTERVIEW_CATEGORIES,
  getCategoryById,
  getAllCategoryIds,
  isValidCategory,
  getCategoryContext,
  getAllCategories,
} from './categories';

/**
 * Feature: interview-prep-app, Property 2: Category configuration includes context
 * Validates: Requirements 1.4
 * 
 * For any selected category, the HF Model configuration should include 
 * category-specific context that references the selected category.
 */
describe('Property 2: Category configuration includes context', () => {
  it('should include non-empty context for any valid category', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllCategoryIds()),
        (categoryId) => {
          // Get the category configuration
          const category = getCategoryById(categoryId);
          
          // Category should exist
          expect(category).toBeDefined();
          
          // Category should have a non-empty context
          expect(category!.context).toBeDefined();
          expect(category!.context.length).toBeGreaterThan(0);
          expect(category!.context.trim()).not.toBe('');
          
          // Context should be a string
          expect(typeof category!.context).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have context accessible via getCategoryContext helper', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllCategoryIds()),
        (categoryId) => {
          const context = getCategoryContext(categoryId);
          
          // Context should be non-empty
          expect(context).toBeDefined();
          expect(context.length).toBeGreaterThan(0);
          expect(context.trim()).not.toBe('');
          
          // Context should match the category's context field
          const category = getCategoryById(categoryId);
          expect(context).toBe(category!.context);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all 20 categories with context', () => {
    const categories = getAllCategories();
    
    // Should have exactly 20 categories
    expect(categories.length).toBe(20);
    
    // Every category should have context
    categories.forEach(category => {
      expect(category.context).toBeDefined();
      expect(category.context.length).toBeGreaterThan(0);
      expect(category.context.trim()).not.toBe('');
    });
  });
});

describe('Category Configuration Loader', () => {
  describe('getCategoryById', () => {
    it('should return category for valid ID', () => {
      const category = getCategoryById('software-engineering');
      expect(category).toBeDefined();
      expect(category?.id).toBe('software-engineering');
      expect(category?.name).toBe('Software Engineering');
    });

    it('should return undefined for invalid ID', () => {
      const category = getCategoryById('non-existent-category');
      expect(category).toBeUndefined();
    });
  });

  describe('getAllCategoryIds', () => {
    it('should return all 20 category IDs', () => {
      const ids = getAllCategoryIds();
      expect(ids.length).toBe(20);
      expect(ids).toContain('software-engineering');
      expect(ids).toContain('data-science');
      expect(ids).toContain('devops');
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('software-engineering')).toBe(true);
      expect(isValidCategory('marketing')).toBe(true);
      expect(isValidCategory('finance')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('invalid-category')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory('random-text')).toBe(false);
    });
  });

  describe('getCategoryContext', () => {
    it('should return context for valid category', () => {
      const context = getCategoryContext('software-engineering');
      expect(context).toBeTruthy();
      expect(context.length).toBeGreaterThan(0);
    });

    it('should return empty string for invalid category', () => {
      const context = getCategoryContext('invalid-category');
      expect(context).toBe('');
    });
  });

  describe('getAllCategories', () => {
    it('should return all 20 categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBe(20);
    });

    it('should return a copy (not mutate original)', () => {
      const categories = getAllCategories();
      const originalLength = INTERVIEW_CATEGORIES.length;
      
      categories.pop(); // Mutate the returned array
      
      expect(INTERVIEW_CATEGORIES.length).toBe(originalLength);
    });
  });
});
