import { describe, it, expect } from 'vitest';
import { getActivityDescription, getDifficultyColor, formatDuration, getCategoryColor } from './activityHelpers';

describe('activityHelpers', () => {
  describe('getActivityDescription', () => {
    describe('Basic functionality', () => {
      it('returns stress-focused message when user is stressed', () => {
        const result = getActivityDescription(true);

        expect(result).toBe('Focus on calming activities to reduce stress');
        expect(result).toContain('calming');
        expect(result).toContain('stress');
      });

      it('returns wellness-focused message when user is not stressed', () => {
        const result = getActivityDescription(false);

        expect(result).toBe('Engage in productive activities to maintain wellness');
        expect(result).toContain('productive');
        expect(result).toContain('wellness');
      });
    });

    describe('Input validation', () => {
      it('handles boolean true correctly', () => {
        const result = getActivityDescription(true);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('handles boolean false correctly', () => {
        const result = getActivityDescription(false);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('treats truthy values as true', () => {
        const truthyResult = getActivityDescription(1 as unknown as boolean);
        const trueResult = getActivityDescription(true);
        expect(truthyResult).toBe(trueResult);
      });

      it('treats falsy values as false', () => {
        const falsyResult = getActivityDescription(0 as unknown as boolean);
        const falseResult = getActivityDescription(false);
        expect(falsyResult).toBe(falseResult);
      });
    });

    describe('Return value properties', () => {
      it('always returns a non-empty string', () => {
        expect(getActivityDescription(true)).toMatch(/^.+$/);
        expect(getActivityDescription(false)).toMatch(/^.+$/);
      });

      it('returns different descriptions for different states', () => {
        const stressedDescription = getActivityDescription(true);
        const normalDescription = getActivityDescription(false);
        expect(stressedDescription).not.toBe(normalDescription);
      });

      it('returns descriptive and helpful text', () => {
        const stressedDesc = getActivityDescription(true);
        const normalDesc = getActivityDescription(false);

        // Should be reasonably long and descriptive
        expect(stressedDesc.length).toBeGreaterThan(20);
        expect(normalDesc.length).toBeGreaterThan(20);

        // Should contain helpful information
        expect(stressedDesc).toMatch(/\w+\s+\w+/); // At least two words
        expect(normalDesc).toMatch(/\w+\s+\w+/); // At least two words
      });
    });
  });

  describe('getDifficultyColor', () => {
    describe('Valid difficulty levels', () => {
      it('returns green for Easy difficulty', () => {
        const result = getDifficultyColor('Easy');
        expect(result).toBe('#50c878');
      });

      it('returns yellow for Medium difficulty', () => {
        const result = getDifficultyColor('Medium');
        expect(result).toBe('#ffc107');
      });

      it('returns red for Hard difficulty', () => {
        const result = getDifficultyColor('Hard');
        expect(result).toBe('#dc3545');
      });
    });

    describe('Invalid difficulty levels', () => {
      it('returns default green for invalid difficulty', () => {
        const result = getDifficultyColor('Invalid');
        expect(result).toBe('#50c878');
      });

      it('returns default green for empty string', () => {
        const result = getDifficultyColor('');
        expect(result).toBe('#50c878');
      });

      it('returns default green for undefined', () => {
        const result = getDifficultyColor(undefined as unknown as string);
        expect(result).toBe('#50c878');
      });

      it('returns default green for null', () => {
        const result = getDifficultyColor(null as unknown as string);
        expect(result).toBe('#50c878');
      });
    });

    describe('Case sensitivity', () => {
      it('is case sensitive - lowercase easy returns default', () => {
        const result = getDifficultyColor('easy');
        expect(result).toBe('#50c878'); // Default, not Easy color
      });

      it('is case sensitive - EASY returns default', () => {
        const result = getDifficultyColor('EASY');
        expect(result).toBe('#50c878'); // Default, not Easy color
      });

      it('is case sensitive - mixed case returns default', () => {
        const result = getDifficultyColor('EaSy');
        expect(result).toBe('#50c878'); // Default
      });
    });

    describe('Edge cases', () => {
      it('handles whitespace variations', () => {
        expect(getDifficultyColor(' Easy ')).toBe('#50c878'); // Default due to whitespace
        expect(getDifficultyColor('Easy ')).toBe('#50c878'); // Default due to trailing space
        expect(getDifficultyColor(' Easy')).toBe('#50c878'); // Default due to leading space
      });

      it('handles special characters', () => {
        expect(getDifficultyColor('Easy!')).toBe('#50c878'); // Default
        expect(getDifficultyColor('Medium-')).toBe('#50c878'); // Default
      });
    });

    describe('Color format validation', () => {
      it('returns valid hex colors', () => {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

        expect(getDifficultyColor('Easy')).toMatch(hexColorRegex);
        expect(getDifficultyColor('Medium')).toMatch(hexColorRegex);
        expect(getDifficultyColor('Hard')).toMatch(hexColorRegex);
        expect(getDifficultyColor('Invalid')).toMatch(hexColorRegex);
      });
    });
  });

  describe('formatDuration', () => {
    describe('Valid duration inputs', () => {
      it('returns the duration when provided', () => {
        expect(formatDuration('5 min')).toBe('5 min');
        expect(formatDuration('10 minutes')).toBe('10 minutes');
        expect(formatDuration('1 hour')).toBe('1 hour');
        expect(formatDuration('30 sec')).toBe('30 sec');
      });

      it('handles various duration formats', () => {
        expect(formatDuration('2-3 min')).toBe('2-3 min');
        expect(formatDuration('15-20 minutes')).toBe('15-20 minutes');
        expect(formatDuration('As needed')).toBe('As needed');
        expect(formatDuration('Ongoing')).toBe('Ongoing');
      });
    });

    describe('Empty or undefined inputs', () => {
      it('returns "Variable" for undefined', () => {
        expect(formatDuration(undefined)).toBe('Variable');
      });

      it('returns "Variable" for empty string', () => {
        expect(formatDuration('')).toBe('Variable');
      });

      it('returns "Variable" for null', () => {
        expect(formatDuration(null as unknown as string)).toBe('Variable');
      });
    });

    describe('Edge cases', () => {
      it('handles whitespace-only strings', () => {
        expect(formatDuration('   ')).toBe('   '); // Preserves whitespace
        expect(formatDuration('\t')).toBe('\t'); // Preserves tab
        expect(formatDuration('\n')).toBe('\n'); // Preserves newline
      });

      it('handles very long duration strings', () => {
        const longDuration = 'A very long duration description that goes on and on';
        expect(formatDuration(longDuration)).toBe(longDuration);
      });

      it('handles special characters in duration', () => {
        expect(formatDuration('5-10 min 🕐')).toBe('5-10 min 🕐');
        expect(formatDuration('~15 minutes')).toBe('~15 minutes');
      });
    });

    describe('Type safety', () => {
      it('always returns a string', () => {
        expect(typeof formatDuration('5 min')).toBe('string');
        expect(typeof formatDuration(undefined)).toBe('string');
        expect(typeof formatDuration('')).toBe('string');
      });
    });
  });

  describe('getCategoryColor', () => {
    describe('Valid categories', () => {
      it('returns blue for breathing category', () => {
        expect(getCategoryColor('breathing')).toBe('#667eea');
        expect(getCategoryColor('Breathing')).toBe('#667eea');
        expect(getCategoryColor('BREATHING')).toBe('#667eea');
      });

      it('returns purple for mindfulness category', () => {
        expect(getCategoryColor('mindfulness')).toBe('#764ba2');
        expect(getCategoryColor('Mindfulness')).toBe('#764ba2');
        expect(getCategoryColor('MINDFULNESS')).toBe('#764ba2');
      });

      it('returns green for exercise category', () => {
        expect(getCategoryColor('exercise')).toBe('#50c878');
        expect(getCategoryColor('Exercise')).toBe('#50c878');
        expect(getCategoryColor('EXERCISE')).toBe('#50c878');
      });

      it('returns red for creative category', () => {
        expect(getCategoryColor('creative')).toBe('#ff6b6b');
        expect(getCategoryColor('Creative')).toBe('#ff6b6b');
        expect(getCategoryColor('CREATIVE')).toBe('#ff6b6b');
      });
    });

    describe('Case insensitivity', () => {
      it('handles mixed case correctly', () => {
        expect(getCategoryColor('BrEaThInG')).toBe('#667eea');
        expect(getCategoryColor('MiNdFuLnEsS')).toBe('#764ba2');
        expect(getCategoryColor('ExErCiSe')).toBe('#50c878');
        expect(getCategoryColor('CrEaTiVe')).toBe('#ff6b6b');
      });

      it('handles lowercase consistently', () => {
        const categories = ['breathing', 'mindfulness', 'exercise', 'creative'];
        const expectedColors = ['#667eea', '#764ba2', '#50c878', '#ff6b6b'];

        categories.forEach((category, index) => {
          expect(getCategoryColor(category)).toBe(expectedColors[index]);
        });
      });

      it('handles uppercase consistently', () => {
        const categories = ['BREATHING', 'MINDFULNESS', 'EXERCISE', 'CREATIVE'];
        const expectedColors = ['#667eea', '#764ba2', '#50c878', '#ff6b6b'];

        categories.forEach((category, index) => {
          expect(getCategoryColor(category)).toBe(expectedColors[index]);
        });
      });
    });

    describe('Invalid categories', () => {
      it('returns default blue for unknown category', () => {
        expect(getCategoryColor('unknown')).toBe('#667eea');
        expect(getCategoryColor('invalid')).toBe('#667eea');
        expect(getCategoryColor('test')).toBe('#667eea');
      });

      it('returns default blue for empty string', () => {
        expect(getCategoryColor('')).toBe('#667eea');
      });

      it('returns default blue for undefined', () => {
        expect(getCategoryColor(undefined as unknown as string)).toBe('#667eea');
      });

      it('returns default blue for null', () => {
        expect(getCategoryColor(null as unknown as string)).toBe('#667eea');
      });
    });

    describe('Edge cases', () => {
      it('handles categories with whitespace', () => {
        expect(getCategoryColor(' breathing ')).toBe('#667eea');
        expect(getCategoryColor('breathing ')).toBe('#667eea');
        expect(getCategoryColor(' breathing')).toBe('#667eea');
      });

      it('handles categories with special characters', () => {
        expect(getCategoryColor('breathing!')).toBe('#667eea'); // Default due to special char
        expect(getCategoryColor('mindfulness-')).toBe('#667eea'); // Default due to special char
      });

      it('handles partial matches', () => {
        expect(getCategoryColor('breath')).toBe('#667eea'); // Default, not breathing
        expect(getCategoryColor('mind')).toBe('#667eea'); // Default, not mindfulness
      });
    });

    describe('Color format validation', () => {
      it('returns valid hex colors', () => {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

        expect(getCategoryColor('breathing')).toMatch(hexColorRegex);
        expect(getCategoryColor('mindfulness')).toMatch(hexColorRegex);
        expect(getCategoryColor('exercise')).toMatch(hexColorRegex);
        expect(getCategoryColor('creative')).toMatch(hexColorRegex);
        expect(getCategoryColor('invalid')).toMatch(hexColorRegex);
      });

      it('returns colors that are visually distinct', () => {
        const colors = [
          getCategoryColor('breathing'),
          getCategoryColor('mindfulness'),
          getCategoryColor('exercise'),
          getCategoryColor('creative'),
        ];

        // All colors should be different
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBe(4);
      });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      // Test getActivityDescription
      const activityResult1 = getActivityDescription(true);
      const activityResult2 = getActivityDescription(true);
      expect(activityResult1).toBe(activityResult2);
      expect(activityResult1).toBe('Focus on calming activities to reduce stress');

      // Test getDifficultyColor
      const difficultyResult1 = getDifficultyColor('Easy');
      const difficultyResult2 = getDifficultyColor('Easy');
      expect(difficultyResult1).toBe(difficultyResult2);
      expect(difficultyResult1).toBe('#50c878');

      // Test formatDuration
      const durationResult1 = formatDuration('5 min');
      const durationResult2 = formatDuration('5 min');
      expect(durationResult1).toBe(durationResult2);
      expect(durationResult1).toBe('5 min');

      // Test getCategoryColor
      const categoryResult1 = getCategoryColor('breathing');
      const categoryResult2 = getCategoryColor('breathing');
      expect(categoryResult1).toBe(categoryResult2);
      expect(categoryResult1).toBe('#667eea');
    });

    it('should handle repeated calls efficiently', () => {
      const start = performance.now();

      // Execute functions many times
      for (let i = 0; i < 1000; i++) {
        getActivityDescription(i % 2 === 0);
        getDifficultyColor(['Easy', 'Medium', 'Hard'][i % 3]);
        formatDuration(i % 2 === 0 ? '5 min' : undefined);
        getCategoryColor(['breathing', 'mindfulness', 'exercise', 'creative'][i % 4]);
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time (less than 100ms for 4000 calls)
      expect(executionTime).toBeLessThan(100);
    });

    it('should not mutate inputs or global state', () => {
      const originalString = 'breathing';
      const originalBoolean = true;

      getCategoryColor(originalString);
      getActivityDescription(originalBoolean);

      // Inputs should remain unchanged
      expect(originalString).toBe('breathing');
      expect(originalBoolean).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should work together for complete activity configuration', () => {
      const isStressed = true;
      const difficulty = 'Easy';
      const category = 'breathing';
      const duration = '5 min';

      const description = getActivityDescription(isStressed);
      const difficultyColor = getDifficultyColor(difficulty);
      const categoryColor = getCategoryColor(category);
      const formattedDuration = formatDuration(duration);

      // All functions should return valid results
      expect(description).toContain('calming');
      expect(difficultyColor).toBe('#50c878');
      expect(categoryColor).toBe('#667eea');
      expect(formattedDuration).toBe('5 min');

      // Colors should be valid hex values
      expect(difficultyColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categoryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should handle edge case combinations gracefully', () => {
      const description = getActivityDescription(false);
      const difficultyColor = getDifficultyColor('');
      const categoryColor = getCategoryColor(undefined as unknown as string);
      const formattedDuration = formatDuration(null as unknown as string);

      // Should all return sensible defaults
      expect(description).toContain('wellness');
      expect(difficultyColor).toBe('#50c878');
      expect(categoryColor).toBe('#667eea');
      expect(formattedDuration).toBe('Variable');
    });
  });
});
