import { describe, it, expect } from 'vitest';
import { getEmailDescription, getTaskDescription } from './getWorkAreaDescription';

describe('getWorkAreaDescription', () => {
  describe('getEmailDescription', () => {
    describe('Stressed State', () => {
      it('returns stress-focused description when user is stressed', () => {
        const result = getEmailDescription(true);
        expect(result).toBe('Showing only essential emails to reduce cognitive load');
      });

      it('contains stress-related keywords in stressed description', () => {
        const result = getEmailDescription(true);
        expect(result.toLowerCase()).toContain('essential');
        expect(result.toLowerCase()).toContain('cognitive load');
      });
    });

    describe('Normal State', () => {
      it('returns normal description when user is not stressed', () => {
        const result = getEmailDescription(false);
        expect(result).toBe('Organized email view with focused and other emails for better clarity');
      });

      it('contains organization-related keywords in normal description', () => {
        const result = getEmailDescription(false);
        expect(result.toLowerCase()).toContain('organized');
        expect(result.toLowerCase()).toContain('focused');
        expect(result.toLowerCase()).toContain('clarity');
      });
    });

    describe('Input Validation', () => {
      it('handles boolean true correctly', () => {
        const result = getEmailDescription(true);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('handles boolean false correctly', () => {
        const result = getEmailDescription(false);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('treats truthy values as true', () => {
        const truthyResult = getEmailDescription(1 as unknown as boolean);
        const trueResult = getEmailDescription(true);
        expect(truthyResult).toBe(trueResult);
      });

      it('treats falsy values as false', () => {
        const falsyResult = getEmailDescription(0 as unknown as boolean);
        const falseResult = getEmailDescription(false);
        expect(falsyResult).toBe(falseResult);
      });
    });

    describe('Return Value Properties', () => {
      it('always returns a non-empty string', () => {
        expect(getEmailDescription(true)).toMatch(/^.+$/);
        expect(getEmailDescription(false)).toMatch(/^.+$/);
      });

      it('returns different descriptions for different states', () => {
        const stressedDescription = getEmailDescription(true);
        const normalDescription = getEmailDescription(false);
        expect(stressedDescription).not.toBe(normalDescription);
      });

      it('returns descriptive and helpful text', () => {
        const stressedDesc = getEmailDescription(true);
        const normalDesc = getEmailDescription(false);

        // Should be reasonably long and descriptive
        expect(stressedDesc.length).toBeGreaterThan(20);
        expect(normalDesc.length).toBeGreaterThan(20);

        // Should contain helpful information
        expect(stressedDesc).toMatch(/\w+\s+\w+/); // At least two words
        expect(normalDesc).toMatch(/\w+\s+\w+/); // At least two words
      });
    });
  });

  describe('getTaskDescription', () => {
    describe('Stressed State', () => {
      it('returns stress-focused description when user is stressed', () => {
        const result = getTaskDescription(true);
        expect(result).toBe('Simplified task view focused on immediate priorities');
      });

      it('contains stress-related keywords in stressed description', () => {
        const result = getTaskDescription(true);
        expect(result.toLowerCase()).toContain('simplified');
        expect(result.toLowerCase()).toContain('immediate');
        expect(result.toLowerCase()).toContain('priorities');
      });
    });

    describe('Normal State', () => {
      it('returns normal description when user is not stressed', () => {
        const result = getTaskDescription(false);
        expect(result).toBe('Stress-aware task organization for better productivity');
      });

      it('contains productivity-related keywords in normal description', () => {
        const result = getTaskDescription(false);
        expect(result.toLowerCase()).toContain('stress-aware');
        expect(result.toLowerCase()).toContain('organization');
        expect(result.toLowerCase()).toContain('productivity');
      });
    });

    describe('Input Validation', () => {
      it('handles boolean true correctly', () => {
        const result = getTaskDescription(true);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('handles boolean false correctly', () => {
        const result = getTaskDescription(false);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('treats truthy values as true', () => {
        const truthyResult = getTaskDescription('stressed' as unknown as boolean);
        const trueResult = getTaskDescription(true);
        expect(truthyResult).toBe(trueResult);
      });

      it('treats falsy values as false', () => {
        const falsyResult = getTaskDescription(null as unknown as boolean);
        const falseResult = getTaskDescription(false);
        expect(falsyResult).toBe(falseResult);
      });
    });

    describe('Return Value Properties', () => {
      it('always returns a non-empty string', () => {
        expect(getTaskDescription(true)).toMatch(/^.+$/);
        expect(getTaskDescription(false)).toMatch(/^.+$/);
      });

      it('returns different descriptions for different states', () => {
        const stressedDescription = getTaskDescription(true);
        const normalDescription = getTaskDescription(false);
        expect(stressedDescription).not.toBe(normalDescription);
      });

      it('returns descriptive and helpful text', () => {
        const stressedDesc = getTaskDescription(true);
        const normalDesc = getTaskDescription(false);

        // Should be reasonably long and descriptive
        expect(stressedDesc.length).toBeGreaterThan(20);
        expect(normalDesc.length).toBeGreaterThan(20);

        // Should contain helpful information
        expect(stressedDesc).toMatch(/\w+\s+\w+/); // At least two words
        expect(normalDesc).toMatch(/\w+\s+\w+/); // At least two words
      });
    });
  });

  describe('Function Consistency', () => {
    it('both functions follow the same pattern for stressed state', () => {
      const emailStressed = getEmailDescription(true);
      const taskStressed = getTaskDescription(true);

      // Both should indicate reduced/simplified functionality
      expect(emailStressed.toLowerCase()).toMatch(/(essential|reduce|cognitive)/);
      expect(taskStressed.toLowerCase()).toMatch(/(simplified|immediate|priorities)/);
    });

    it('both functions follow the same pattern for normal state', () => {
      const emailNormal = getEmailDescription(false);
      const taskNormal = getTaskDescription(false);

      // Both should indicate enhanced/organized functionality
      expect(emailNormal.toLowerCase()).toMatch(/(organized|clarity)/);
      expect(taskNormal.toLowerCase()).toMatch(/(organization|productivity)/);
    });

    it('both functions return strings of similar length', () => {
      const emailStressed = getEmailDescription(true);
      const emailNormal = getEmailDescription(false);
      const taskStressed = getTaskDescription(true);
      const taskNormal = getTaskDescription(false);

      const lengths = [emailStressed.length, emailNormal.length, taskStressed.length, taskNormal.length];
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);

      // Should be within reasonable range of each other
      expect(maxLength - minLength).toBeLessThan(30);
    });
  });

  describe('User Experience', () => {
    it('provides clear guidance for stressed users', () => {
      const emailDesc = getEmailDescription(true);
      const taskDesc = getTaskDescription(true);

      // Should explain what the user will see and why
      expect(emailDesc).toContain('essential');
      expect(emailDesc).toContain('cognitive load');
      expect(taskDesc).toContain('immediate priorities');
    });

    it('provides clear guidance for normal users', () => {
      const emailDesc = getEmailDescription(false);
      const taskDesc = getTaskDescription(false);

      // Should explain the benefits of the organization
      expect(emailDesc).toContain('clarity');
      expect(taskDesc).toContain('productivity');
    });

    it('uses appropriate tone for both states', () => {
      const stressedDescriptions = [getEmailDescription(true), getTaskDescription(true)];
      const normalDescriptions = [getEmailDescription(false), getTaskDescription(false)];

      // Stressed descriptions should be calming/supportive
      stressedDescriptions.forEach((desc) => {
        expect(desc.toLowerCase()).toMatch(/(reduce|simplified|essential|immediate)/);
      });

      // Normal descriptions should be optimizing/enhancing
      normalDescriptions.forEach((desc) => {
        expect(desc.toLowerCase()).toMatch(/(better|organized|productivity|clarity)/);
      });
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('handles multiple rapid calls consistently', () => {
      const results = Array.from({ length: 100 }, () => getEmailDescription(true));
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(1); // All should be the same
    });

    it('returns consistent results regardless of call order', () => {
      const sequence1 = [getEmailDescription(true), getTaskDescription(false)];
      const sequence2 = [getTaskDescription(false), getEmailDescription(true)];

      expect(sequence1[0]).toBe(sequence2[1]);
      expect(sequence1[1]).toBe(sequence2[0]);
    });

    it('performs well with many calls', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        getEmailDescription(i % 2 === 0);
        getTaskDescription(i % 2 === 1);
      }
      const end = performance.now();

      // Should execute 20000 calls very quickly
      expect(end - start).toBeLessThan(50);
    });
  });
});
