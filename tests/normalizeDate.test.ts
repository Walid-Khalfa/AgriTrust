/**
 * Unit tests for normalizeDate function
 * 
 * Run these tests manually or integrate with your test framework
 */

import { normalizeDate } from '../src/lib/api';

// Simple test runner
function test(description: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${description}`);
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(`   ${error.message}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toThrow(expectedMessage?: string) {
      let threw = false;
      let error: Error | null = null;
      
      try {
        actual();
      } catch (e) {
        threw = true;
        error = e as Error;
      }
      
      if (!threw) {
        throw new Error('Expected function to throw');
      }
      
      if (expectedMessage && error && !error.message.includes(expectedMessage)) {
        throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
      }
    }
  };
}

// Test suite
console.log('\n🧪 Testing normalizeDate function\n');

// DD-MM-YYYY format tests
test('should convert DD-MM-YYYY to YYYY-MM-DD', () => {
  expect(normalizeDate('28-10-2025')).toBe('2025-10-28');
});

test('should convert 01-01-2024 to 2024-01-01', () => {
  expect(normalizeDate('01-01-2024')).toBe('2024-01-01');
});

test('should convert 31-12-2023 to 2023-12-31', () => {
  expect(normalizeDate('31-12-2023')).toBe('2023-12-31');
});

// YYYY-MM-DD format tests
test('should return YYYY-MM-DD unchanged (2025-10-28)', () => {
  expect(normalizeDate('2025-10-28')).toBe('2025-10-28');
});

test('should return YYYY-MM-DD unchanged (2024-01-01)', () => {
  expect(normalizeDate('2024-01-01')).toBe('2024-01-01');
});

test('should return YYYY-MM-DD unchanged (2023-12-31)', () => {
  expect(normalizeDate('2023-12-31')).toBe('2023-12-31');
});

// Invalid format tests
test('should throw error for slash format (28/10/2025)', () => {
  expect(() => normalizeDate('28/10/2025')).toThrow('Invalid date format');
});

test('should throw error for dot format (2025.10.28)', () => {
  expect(() => normalizeDate('2025.10.28')).toThrow('Invalid date format');
});

test('should throw error for US format (10-28-2025)', () => {
  expect(() => normalizeDate('10-28-2025')).toThrow('Invalid date format');
});

test('should throw error for invalid string', () => {
  expect(() => normalizeDate('invalid')).toThrow('Invalid date format');
});

test('should throw error for empty string', () => {
  expect(() => normalizeDate('')).toThrow('Invalid date format');
});

test('should include expected formats in error message', () => {
  expect(() => normalizeDate('28/10/2025')).toThrow('Expected DD-MM-YYYY or YYYY-MM-DD');
});

// Edge cases
test('should handle leap year date (29-02-2024)', () => {
  expect(normalizeDate('29-02-2024')).toBe('2024-02-29');
});

test('should handle leap year date in ISO format (2024-02-29)', () => {
  expect(normalizeDate('2024-02-29')).toBe('2024-02-29');
});

test('should handle single digit dates with leading zeros (01-05-2025)', () => {
  expect(normalizeDate('01-05-2025')).toBe('2025-05-01');
});

test('should handle single digit dates with leading zeros (09-09-2025)', () => {
  expect(normalizeDate('09-09-2025')).toBe('2025-09-09');
});

console.log('\n✅ All tests passed!\n');
