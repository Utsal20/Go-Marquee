import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import TextInputComponent from '../TextInputComponent';

describe('TextInputComponent Property Tests', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  /**
   * Feature: gomarquee, Property 1: Input Validation and Processing
   * For any string input, the text customizer should accept it if and only if 
   * it contains only alphanumeric characters, spaces, and common punctuation, 
   * and is 500 characters or fewer in length
   * Validates: Requirements 1.1, 1.4
   */
  it('Property 1: Input Validation and Processing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 600 }), // Test strings up to 600 chars to test limit
        (inputString) => {
          cleanup(); // Clean up before each property test iteration
          const mockOnChange = vi.fn();
          
          // Start with a different value to ensure onChange is called
          const initialValue = inputString === '' ? 'initial' : '';
          
          const { unmount } = render(
            <TextInputComponent
              value={initialValue}
              onChange={mockOnChange}
              maxLength={500}
            />
          );
          
          const textarea = screen.getByRole('textbox');
          fireEvent.change(textarea, { target: { value: inputString } });
          
          // Define what characters are valid according to requirements
          const validCharPattern = /^[a-zA-Z0-9\s.,!?;:'"_\-()[\]{}@#$%&*+=\/\\|~`^<>]*$/;
          const isValidCharacters = validCharPattern.test(inputString);
          const isValidLength = inputString.length <= 500;
          
          if (isValidCharacters && isValidLength) {
            // Should accept the input
            expect(mockOnChange).toHaveBeenCalledWith(inputString);
          } else if (isValidCharacters && !isValidLength) {
            // Should not call onChange if length exceeds limit
            expect(mockOnChange).not.toHaveBeenCalled();
          } else {
            // Should sanitize invalid characters and call onChange with sanitized version
            const sanitized = inputString.match(/[a-zA-Z0-9\s.,!?;:'"_\-()[\]{}@#$%&*+=\/\\|~`^<>]/g)?.join('') || '';
            if (sanitized.length <= 500) {
              expect(mockOnChange).toHaveBeenCalledWith(sanitized);
            } else {
              expect(mockOnChange).not.toHaveBeenCalled();
            }
          }
          
          unmount(); // Clean up after each iteration
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for character limit enforcement
   * For any valid input string, if it exceeds maxLength, the component should not accept it
   */
  it('Property: Character limit enforcement', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // maxLength
        fc.string({ minLength: 0, maxLength: 1200 }), // input string
        (maxLength, inputString) => {
          cleanup(); // Clean up before each property test iteration
          const mockOnChange = vi.fn();
          
          // Start with a different value to ensure onChange is called
          const initialValue = inputString === '' ? 'initial' : '';
          
          const { unmount } = render(
            <TextInputComponent
              value={initialValue}
              onChange={mockOnChange}
              maxLength={maxLength}
            />
          );
          
          const textarea = screen.getByRole('textbox');
          fireEvent.change(textarea, { target: { value: inputString } });
          
          // Sanitize the input first
          const sanitized = inputString.match(/[a-zA-Z0-9\s.,!?;:'"_\-()[\]{}@#$%&*+=\/\\|~`^<>]/g)?.join('') || '';
          
          if (sanitized.length <= maxLength) {
            expect(mockOnChange).toHaveBeenCalledWith(sanitized);
          } else {
            expect(mockOnChange).not.toHaveBeenCalled();
          }
          
          unmount(); // Clean up after each iteration
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for input sanitization consistency
   * For any input, the sanitization should be consistent and only allow valid characters
   */
  it('Property: Input sanitization consistency', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }),
        (inputString) => {
          cleanup(); // Clean up before each property test iteration
          const mockOnChange = vi.fn();
          
          // Start with a different value to ensure onChange is called
          const initialValue = inputString === '' ? 'initial' : '';
          
          const { unmount } = render(
            <TextInputComponent
              value={initialValue}
              onChange={mockOnChange}
              maxLength={500}
            />
          );
          
          const textarea = screen.getByRole('textbox');
          fireEvent.change(textarea, { target: { value: inputString } });
          
          if (mockOnChange.mock.calls.length > 0) {
            const sanitizedOutput = mockOnChange.mock.calls[0][0];
            
            // The sanitized output should only contain valid characters
            const validCharPattern = /^[a-zA-Z0-9\s.,!?;:'"_\-()[\]{}@#$%&*+=\/\\|~`^<>]*$/;
            expect(validCharPattern.test(sanitizedOutput)).toBe(true);
            
            // The sanitized output should be a subset of the original input
            // (all characters in output should exist in input, though order might differ due to filtering)
            for (const char of sanitizedOutput) {
              expect(inputString.includes(char)).toBe(true);
            }
          }
          
          unmount(); // Clean up after each iteration
        }
      ),
      { numRuns: 100 }
    );
  });
});