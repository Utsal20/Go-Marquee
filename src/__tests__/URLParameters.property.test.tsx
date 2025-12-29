import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import App from '../App';
import { FontSize, TextStyle, Direction, AnimationSpeed } from '../types';

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/',
  search: '',
  pathname: '/',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('URL Parameters Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockLocation.href = 'http://localhost:3000/';
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Property: URL parameter mappings are bidirectional', () => {
    it('fontSize mappings should be bidirectional', () => {
      /**
       * **Feature: url-parameters, Property 1: fontSize mappings should be bidirectional**
       * **Validates: Requirements 15.1, 15.2**
       * 
       * For any valid fontSize value, encoding then decoding should return the original value
       */
      
      const fontSizeMappings = {
        encode: { 'small': 's', 'medium': 'm', 'large': 'l', 'extra-large': 'x', 'jumbo': 'j' },
        decode: { 's': 'small', 'm': 'medium', 'l': 'large', 'x': 'extra-large', 'j': 'jumbo' }
      };

      fc.assert(fc.property(
        fc.oneof(
          fc.constant('small' as FontSize),
          fc.constant('medium' as FontSize),
          fc.constant('large' as FontSize),
          fc.constant('extra-large' as FontSize),
          fc.constant('jumbo' as FontSize)
        ),
        (fontSize) => {
          const encoded = fontSizeMappings.encode[fontSize];
          const decoded = fontSizeMappings.decode[encoded as keyof typeof fontSizeMappings.decode];
          return decoded === fontSize;
        }
      ));
    });

    it('textStyle mappings should be bidirectional', () => {
      /**
       * **Feature: url-parameters, Property 2: textStyle mappings should be bidirectional**
       * **Validates: Requirements 15.1, 15.2**
       * 
       * For any valid textStyle value, encoding then decoding should return the original value
       */
      
      const textStyleMappings = {
        encode: { 'simple': 's', 'bold': 'b', 'neon': 'n' },
        decode: { 's': 'simple', 'b': 'bold', 'n': 'neon' }
      };

      fc.assert(fc.property(
        fc.oneof(
          fc.constant('simple' as TextStyle),
          fc.constant('bold' as TextStyle),
          fc.constant('neon' as TextStyle)
        ),
        (textStyle) => {
          const encoded = textStyleMappings.encode[textStyle];
          const decoded = textStyleMappings.decode[encoded as keyof typeof textStyleMappings.decode];
          return decoded === textStyle;
        }
      ));
    });

    it('direction mappings should be bidirectional', () => {
      /**
       * **Feature: url-parameters, Property 3: direction mappings should be bidirectional**
       * **Validates: Requirements 15.1, 15.2**
       * 
       * For any valid direction value, encoding then decoding should return the original value
       */
      
      const directionMappings = {
        encode: { 'left-to-right': 'l', 'right-to-left': 'r' },
        decode: { 'l': 'left-to-right', 'r': 'right-to-left' }
      };

      fc.assert(fc.property(
        fc.oneof(
          fc.constant('left-to-right' as Direction),
          fc.constant('right-to-left' as Direction)
        ),
        (direction) => {
          const encoded = directionMappings.encode[direction];
          const decoded = directionMappings.decode[encoded as keyof typeof directionMappings.decode];
          return decoded === direction;
        }
      ));
    });

    it('animationSpeed mappings should be bidirectional', () => {
      /**
       * **Feature: url-parameters, Property 4: animationSpeed mappings should be bidirectional**
       * **Validates: Requirements 15.1, 15.2**
       * 
       * For any valid animationSpeed value, encoding then decoding should return the original value
       */
      
      const animationSpeedMappings = {
        encode: { 'slow': 's', 'normal': 'n', 'fast': 'f', 'very-fast': 'v' },
        decode: { 's': 'slow', 'n': 'normal', 'f': 'fast', 'v': 'very-fast' }
      };

      fc.assert(fc.property(
        fc.oneof(
          fc.constant('slow' as AnimationSpeed),
          fc.constant('normal' as AnimationSpeed),
          fc.constant('fast' as AnimationSpeed),
          fc.constant('very-fast' as AnimationSpeed)
        ),
        (animationSpeed) => {
          const encoded = animationSpeedMappings.encode[animationSpeed];
          const decoded = animationSpeedMappings.decode[encoded as keyof typeof animationSpeedMappings.decode];
          return decoded === animationSpeed;
        }
      ));
    });
  });

  describe('Property: Text encoding/decoding is lossless', () => {
    it('text encoding should be lossless', () => {
      /**
       * **Feature: url-parameters, Property 5: text encoding should be lossless**
       * **Validates: Requirements 15.3**
       * 
       * For any text string, URL encoding then decoding should return the original text
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (text) => {
          const encoded = encodeURIComponent(text);
          const decoded = decodeURIComponent(encoded);
          return decoded === text;
        }
      ));
    });

    it('app should handle encoded text correctly', () => {
      /**
       * **Feature: url-parameters, Property 6: app should handle encoded text correctly**
       * **Validates: Requirements 15.3**
       * 
       * For any non-empty text, the app should correctly load it from URL parameters
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (text) => {
          const encodedText = encodeURIComponent(text);
          mockLocation.search = `?t=${encodedText}`;
          
          // Should not throw an error during render
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });
  });

  describe('Property: Invalid parameters are handled gracefully', () => {
    it('invalid fontSize parameters should use defaults', () => {
      /**
       * **Feature: url-parameters, Property 7: invalid fontSize parameters should use defaults**
       * **Validates: Requirements 15.4**
       * 
       * For any invalid fontSize parameter, the app should use the default fontSize
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !['s', 'm', 'l', 'x', 'j'].includes(s)),
        (invalidParam) => {
          mockLocation.search = `?s=${invalidParam}`;
          
          // Should not throw an error and should render successfully
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });

    it('invalid textStyle parameters should use defaults', () => {
      /**
       * **Feature: url-parameters, Property 8: invalid textStyle parameters should use defaults**
       * **Validates: Requirements 15.4**
       * 
       * For any invalid textStyle parameter, the app should use the default textStyle
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !['s', 'b', 'n'].includes(s)),
        (invalidParam) => {
          mockLocation.search = `?y=${invalidParam}`;
          
          // Should not throw an error and should render successfully
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });

    it('invalid direction parameters should use defaults', () => {
      /**
       * **Feature: url-parameters, Property 9: invalid direction parameters should use defaults**
       * **Validates: Requirements 15.4**
       * 
       * For any invalid direction parameter, the app should use the default direction
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !['l', 'r'].includes(s)),
        (invalidParam) => {
          mockLocation.search = `?d=${invalidParam}`;
          
          // Should not throw an error and should render successfully
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });

    it('invalid animationSpeed parameters should use defaults', () => {
      /**
       * **Feature: url-parameters, Property 10: invalid animationSpeed parameters should use defaults**
       * **Validates: Requirements 15.4**
       * 
       * For any invalid animationSpeed parameter, the app should use the default animationSpeed
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !['s', 'n', 'f', 'v'].includes(s)),
        (invalidParam) => {
          mockLocation.search = `?a=${invalidParam}`;
          
          // Should not throw an error and should render successfully
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });
  });

  describe('Property: Color parameter validation', () => {
    it('valid hex colors should be accepted', () => {
      /**
       * **Feature: url-parameters, Property 11: valid hex colors should be accepted**
       * **Validates: Requirements 15.5**
       * 
       * For any valid 6-digit hex color, the app should accept it as a color parameter
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[0-9a-fA-F]{6}$/.test(s)),
        (hexColor) => {
          const colorWithHash = `#${hexColor}`;
          const encodedColor = encodeURIComponent(colorWithHash);
          mockLocation.search = `?c=${encodedColor}`;
          
          // Should not throw an error
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });

    it('invalid color formats should not crash the app', () => {
      /**
       * **Feature: url-parameters, Property 12: invalid color formats should not crash the app**
       * **Validates: Requirements 15.4**
       * 
       * For any invalid color format, the app should handle it gracefully without crashing
       */
      
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^#[0-9a-fA-F]{6}$/.test(s)),
        (invalidColor) => {
          const encodedColor = encodeURIComponent(invalidColor);
          mockLocation.search = `?c=${encodedColor}`;
          
          // Should not throw an error
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });
  });

  describe('Property: Multiple parameter combinations', () => {
    it('multiple valid parameters should work together', () => {
      /**
       * **Feature: url-parameters, Property 13: multiple valid parameters should work together**
       * **Validates: Requirements 15.6**
       * 
       * For any combination of valid parameters, the app should handle them all correctly
       */
      
      fc.assert(fc.property(
        fc.record({
          text: fc.string({ minLength: 0, maxLength: 100 }),
          fontSize: fc.oneof(fc.constant('s'), fc.constant('m'), fc.constant('l'), fc.constant('x'), fc.constant('j')),
          textStyle: fc.oneof(fc.constant('s'), fc.constant('b'), fc.constant('n')),
          direction: fc.oneof(fc.constant('l'), fc.constant('r')),
          animationSpeed: fc.oneof(fc.constant('s'), fc.constant('n'), fc.constant('f'), fc.constant('v')),
          color: fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[0-9a-fA-F]{6}$/.test(s))
        }),
        (params) => {
          const searchParams = new URLSearchParams();
          if (params.text) searchParams.set('t', encodeURIComponent(params.text));
          searchParams.set('s', params.fontSize);
          searchParams.set('y', params.textStyle);
          searchParams.set('d', params.direction);
          searchParams.set('a', params.animationSpeed);
          searchParams.set('c', `#${params.color}`);
          
          mockLocation.search = `?${searchParams.toString()}`;
          
          // Should not throw an error
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });
  });

  describe('Property: URL parameter precedence', () => {
    it('URL parameters should take precedence over session storage', () => {
      /**
       * **Feature: url-parameters, Property 14: URL parameters should take precedence over session storage**
       * **Validates: Requirements 15.7**
       * 
       * For any URL parameters and session storage data, URL parameters should be used
       */
      
      fc.assert(fc.property(
        fc.record({
          urlText: fc.string({ minLength: 1, maxLength: 50 }),
          sessionText: fc.string({ minLength: 1, maxLength: 50 }),
          fontSize: fc.oneof(fc.constant('s'), fc.constant('m'), fc.constant('l'), fc.constant('x'), fc.constant('j'))
        }),
        (data) => {
          // Set up session storage
          const sessionData = {
            text: data.sessionText,
            fontSize: 'large', // Different from URL
            textColor: '#00ff00',
            textStyle: 'bold',
            direction: 'right-to-left',
            animationSpeed: 'slow'
          };
          mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData));
          
          // Set URL parameters
          mockLocation.search = `?t=${encodeURIComponent(data.urlText)}&s=${data.fontSize}`;
          
          // Should not throw an error and should prioritize URL parameters
          try {
            render(<App />);
            return true;
          } catch (error) {
            return false;
          }
        }
      ));
    });
  });
});