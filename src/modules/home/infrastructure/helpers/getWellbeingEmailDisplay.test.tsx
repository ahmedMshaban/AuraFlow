import { describe, it, expect } from 'vitest';
import getWellbeingEmailDisplay from './getWellbeingEmailDisplay';

describe('getWellbeingEmailDisplay', () => {
  describe('Stressed mode - focus only on important emails', () => {
    const isStressed = true;

    it('should show zen message when no focused emails', () => {
      const result = getWellbeingEmailDisplay(0, 5, isStressed);

      expect(result).toEqual({
        count: '',
        label: 'inbox zen achieved! ✨',
        icon: '',
      });
    });

    it('should show singular message for 1 focused email', () => {
      const result = getWellbeingEmailDisplay(1, 10, isStressed);

      expect(result).toEqual({
        count: '',
        label: '1 important email 🎯',
        icon: '',
      });
    });

    it('should show count for 2-3 focused emails', () => {
      const testCases = [
        { focused: 2, others: 8 },
        { focused: 3, others: 15 },
      ];

      testCases.forEach(({ focused, others }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: focused,
          label: 'important emails 🎯',
          icon: '',
        });
      });
    });

    it('should show priority message for 4-5 focused emails', () => {
      const testCases = [
        { focused: 4, others: 20 },
        { focused: 5, others: 25 },
      ];

      testCases.forEach(({ focused, others }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: focused,
          label: 'priority emails 📧',
          icon: '',
        });
      });
    });

    it('should show attention message for 6+ focused emails', () => {
      const testCases = [
        { focused: 6, others: 30 },
        { focused: 10, others: 50 },
        { focused: 20, others: 100 },
      ];

      testCases.forEach(({ focused, others }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: focused,
          label: 'emails need attention ⚡',
          icon: '',
        });
      });
    });

    it('should ignore other emails count in stressed mode', () => {
      // Same focused emails, different other counts should give same result
      const baseResult = getWellbeingEmailDisplay(3, 5, isStressed);
      const varyingOthersResults = [
        getWellbeingEmailDisplay(3, 0, isStressed),
        getWellbeingEmailDisplay(3, 100, isStressed),
        getWellbeingEmailDisplay(3, undefined, isStressed),
      ];

      varyingOthersResults.forEach((result) => {
        expect(result).toEqual(baseResult);
      });
    });
  });

  describe('Normal mode - show all emails with positive framing', () => {
    const isStressed = false;

    it('should show clear message when no emails', () => {
      const result = getWellbeingEmailDisplay(0, 0, isStressed);

      expect(result).toEqual({
        count: '',
        label: 'inbox clear! 🌟',
        icon: '',
      });
    });

    it('should show singular message for 1 total email', () => {
      const testCases = [
        { focused: 1, others: 0 },
        { focused: 0, others: 1 },
      ];

      testCases.forEach(({ focused, others }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: '',
          label: '1 email to read 📬',
          icon: '',
        });
      });
    });

    it('should show explore message for 2-5 total emails', () => {
      const testCases = [
        { focused: 1, others: 1, total: 2 },
        { focused: 2, others: 1, total: 3 },
        { focused: 3, others: 2, total: 5 },
      ];

      testCases.forEach(({ focused, others, total }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: total,
          label: 'emails to explore 📮',
          icon: '',
        });
      });
    });

    it('should show waiting message for 6-15 total emails', () => {
      const testCases = [
        { focused: 3, others: 3, total: 6 },
        { focused: 5, others: 5, total: 10 },
        { focused: 7, others: 8, total: 15 },
      ];

      testCases.forEach(({ focused, others, total }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: total,
          label: 'emails waiting 📪',
          icon: '',
        });
      });
    });

    it('should show inbox message for 16-30 total emails', () => {
      const testCases = [
        { focused: 8, others: 8, total: 16 },
        { focused: 10, others: 15, total: 25 },
        { focused: 15, others: 15, total: 30 },
      ];

      testCases.forEach(({ focused, others, total }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: total,
          label: 'emails in inbox 📬',
          icon: '',
        });
      });
    });

    it('should show organize message for 31+ total emails with rounded count', () => {
      const testCases = [
        { focused: 15, others: 16, total: 31, expected: '30+' },
        { focused: 20, others: 25, total: 45, expected: '40+' },
        { focused: 30, others: 45, total: 75, expected: '70+' },
        { focused: 50, others: 85, total: 135, expected: '130+' },
      ];

      testCases.forEach(({ focused, others, expected }) => {
        const result = getWellbeingEmailDisplay(focused, others, isStressed);

        expect(result).toEqual({
          count: expected,
          label: 'emails to organize 📫',
          icon: '',
        });
      });
    });
  });

  describe('Edge cases and undefined handling', () => {
    it('should handle undefined focused emails as 0', () => {
      const testCases = [
        { stressed: true, others: 5 },
        { stressed: false, others: 5 },
      ];

      testCases.forEach(({ stressed, others }) => {
        const result = getWellbeingEmailDisplay(undefined, others, stressed);

        if (stressed) {
          // Should show zen message in stressed mode
          expect(result.label).toBe('inbox zen achieved! ✨');
        } else {
          // Should treat as 5 total emails in normal mode
          expect(result.count).toBe(others);
          expect(result.label).toBe('emails to explore 📮');
        }
      });
    });

    it('should handle undefined other emails as 0', () => {
      const testCases = [
        { stressed: true, focused: 2 },
        { stressed: false, focused: 3 },
      ];

      testCases.forEach(({ stressed, focused }) => {
        const result = getWellbeingEmailDisplay(focused, undefined, stressed);

        if (stressed) {
          // Should only consider focused emails
          expect(result.count).toBe(focused);
          expect(result.label).toBe('important emails 🎯');
        } else {
          // Should treat as total = focused
          expect(result.count).toBe(focused);
          expect(result.label).toBe('emails to explore 📮');
        }
      });
    });

    it('should handle both undefined counts', () => {
      const testCases = [{ stressed: true }, { stressed: false }];

      testCases.forEach(({ stressed }) => {
        const result = getWellbeingEmailDisplay(undefined, undefined, stressed);

        if (stressed) {
          expect(result.label).toBe('inbox zen achieved! ✨');
        } else {
          expect(result.label).toBe('inbox clear! 🌟');
        }
        expect(result.count).toBe('');
      });
    });

    it('should handle zero values explicitly', () => {
      const result1 = getWellbeingEmailDisplay(0, 0, true);
      const result2 = getWellbeingEmailDisplay(0, 0, false);

      expect(result1.label).toBe('inbox zen achieved! ✨');
      expect(result2.label).toBe('inbox clear! 🌟');
    });
  });

  describe('Type safety and contract validation', () => {
    it('should always return required properties', () => {
      const testCases = [
        { focused: 0, others: 0, stressed: false },
        { focused: 5, others: 10, stressed: true },
        { focused: undefined, others: undefined, stressed: false },
        { focused: 100, others: 200, stressed: true },
      ];

      testCases.forEach(({ focused, others, stressed }) => {
        const result = getWellbeingEmailDisplay(focused, others, stressed);

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('label');
        expect(result).toHaveProperty('icon');

        expect(typeof result.label).toBe('string');
        expect(typeof result.icon).toBe('string');
        expect(result.label.length).toBeGreaterThan(0);
      });
    });

    it('should return consistent count types', () => {
      const testCases = [
        { focused: 0, others: 0, stressed: false },
        { focused: 5, others: 10, stressed: true },
        { focused: 50, others: 100, stressed: false },
      ];

      testCases.forEach(({ focused, others, stressed }) => {
        const result = getWellbeingEmailDisplay(focused, others, stressed);

        // Count should be either number, string, or empty string
        expect(['number', 'string'].includes(typeof result.count)).toBe(true);
      });
    });

    it('should include emojis in appropriate labels', () => {
      const testCases = [
        { focused: 0, others: 0, stressed: false },
        { focused: 1, others: 0, stressed: true },
        { focused: 5, others: 10, stressed: false },
      ];

      testCases.forEach(({ focused, others, stressed }) => {
        const result = getWellbeingEmailDisplay(focused, others, stressed);

        // Labels should contain emojis for visual appeal
        const emojiRegex =
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        expect(emojiRegex.test(result.label)).toBe(true);
      });
    });
  });

  describe('Wellbeing messaging principles', () => {
    it('should use positive language in normal mode', () => {
      const normalModeResults = [
        getWellbeingEmailDisplay(0, 0, false), // 'inbox clear! 🌟'
        getWellbeingEmailDisplay(2, 3, false), // 'emails to explore 📮'
        getWellbeingEmailDisplay(7, 8, false), // 'emails waiting 📪'
      ];

      normalModeResults.forEach((result) => {
        const positiveWords = ['clear', 'explore', 'waiting'];
        const hasPositiveWord = positiveWords.some((word) => result.label.toLowerCase().includes(word));
        expect(hasPositiveWord || result.label.includes('!')).toBe(true);
      });
    });

    it('should use calming language in stressed mode', () => {
      const stressedModeResults = [
        getWellbeingEmailDisplay(0, 10, true),
        getWellbeingEmailDisplay(2, 20, true),
        getWellbeingEmailDisplay(5, 30, true),
      ];

      stressedModeResults.forEach((result) => {
        const calmingWords = ['zen', 'important', 'priority'];
        const hasStressWords = ['overwhelm', 'urgent', 'crisis'].some((word) =>
          result.label.toLowerCase().includes(word),
        );

        // Should not use stress-inducing language
        expect(hasStressWords).toBe(false);

        // Should use calming or focusing language
        const hasCalmingWord = calmingWords.some((word) => result.label.toLowerCase().includes(word));
        expect(hasCalmingWord || result.label.includes('✨')).toBe(true);
      });
    });

    it('should reduce cognitive load in stressed mode by focusing on essentials', () => {
      // In stressed mode, should only show focused emails, not total
      const focusedEmails = 3;
      const otherEmails = 20;

      const stressedResult = getWellbeingEmailDisplay(focusedEmails, otherEmails, true);
      const normalResult = getWellbeingEmailDisplay(focusedEmails, otherEmails, false);

      // Stressed mode should show only focused count
      expect(stressedResult.count).toBe(focusedEmails);

      // Normal mode should show total count
      expect(normalResult.count).toBe(focusedEmails + otherEmails);
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const testParams: Array<[number | undefined, number | undefined, boolean]> = [
        [5, 10, true],
        [0, 0, false],
        [undefined, 20, true],
      ];

      testParams.forEach(([focused, others, stressed]) => {
        const result1 = getWellbeingEmailDisplay(focused, others, stressed);
        const result2 = getWellbeingEmailDisplay(focused, others, stressed);

        expect(result1).toEqual(result2);
      });
    });

    it('should handle large numbers efficiently', () => {
      const start = performance.now();

      // Test with large numbers
      for (let i = 0; i < 100; i++) {
        getWellbeingEmailDisplay(i * 10, i * 20, i % 2 === 0);
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical email volumes', () => {
      const typicalScenarios = [
        { focused: 2, others: 8, stressed: false, description: 'Light email day' },
        { focused: 5, others: 20, stressed: false, description: 'Busy email day' },
        { focused: 10, others: 50, stressed: true, description: 'Overwhelming inbox' },
        { focused: 0, others: 100, stressed: true, description: 'All promotional emails' },
      ];

      typicalScenarios.forEach(({ focused, others, stressed }) => {
        const result = getWellbeingEmailDisplay(focused, others, stressed);

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('label');
        expect(result).toHaveProperty('icon');
        expect(result.label.length).toBeGreaterThan(0);

        // Should provide meaningful feedback for each scenario
        expect(result.label).not.toBe('');
      });
    });

    it('should adapt messaging based on email distribution', () => {
      // High focused, low others vs low focused, high others
      const highFocusedResult = getWellbeingEmailDisplay(10, 5, false);
      const lowFocusedResult = getWellbeingEmailDisplay(2, 20, false);

      // Both should show total count in normal mode
      expect(typeof highFocusedResult.count).toBe('number');
      expect(typeof lowFocusedResult.count).toBe('number');

      // But stressed mode should focus differently
      const highFocusedStressed = getWellbeingEmailDisplay(10, 5, true);
      const lowFocusedStressed = getWellbeingEmailDisplay(2, 20, true);

      expect(highFocusedStressed.count).toBe(10);
      expect(lowFocusedStressed.count).toBe(2);
    });
  });
});
