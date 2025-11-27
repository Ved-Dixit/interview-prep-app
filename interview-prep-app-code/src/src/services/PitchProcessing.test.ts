import * as fc from 'fast-check';
import { SessionManager } from './SessionManager';
import { HuggingFaceService } from './HuggingFaceService';
import { pipeline } from '@xenova/transformers';

// Ensure the mock is properly set up for this test file
jest.mock('@xenova/transformers');

describe('Pitch Processing Property Tests', () => {
  let mockGenerator: jest.Mock;

  beforeEach(() => {
    // Set up mock generator that returns valid pitch analysis
    mockGenerator = jest.fn().mockResolvedValue([{
      generated_text: `Topics: software, engineering
Experience: 5 years development
Skills: JavaScript, React
Interests: web development`
    }]);
    (pipeline as jest.Mock).mockResolvedValue(mockGenerator);
  });

  /**
   * Feature: interview-prep-app, Property 3: Pitch processing preserves and extracts content
   * Validates: Requirements 2.2, 2.3, 2.4
   */
  test('Property 3: For any non-empty pitch, system should capture it completely, analyze it, and store extracted context', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0),
        async (category, pitch) => {
          const sessionManager = new SessionManager();
          const hfService = new HuggingFaceService();

          // Initialize session
          sessionManager.initializeSession(category);

          // Store pitch - should preserve content without modification
          sessionManager.storePitch(pitch);
          const session = sessionManager.getCurrentSession();
          
          // Verify pitch is captured completely (trimmed but otherwise unmodified)
          expect(session?.introductoryPitch).toBe(pitch.trim());

          // Analyze pitch - should extract key information
          const analysis = await hfService.analyzeIntroduction(pitch);
          
          // Verify analysis produces structured output
          expect(analysis).toBeDefined();
          expect(analysis).toHaveProperty('keyTopics');
          expect(analysis).toHaveProperty('experience');
          expect(analysis).toHaveProperty('skills');
          expect(analysis).toHaveProperty('interests');
          
          // Verify extracted context is stored and retrievable
          const context = sessionManager.getContext();
          expect(context.introductoryPitch).toBe(pitch.trim());
          expect(context.category).toBe(category.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});
