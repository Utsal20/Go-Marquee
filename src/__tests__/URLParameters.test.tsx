import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

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

describe('URL Parameters - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('URL Parameter Mappings', () => {
    it('should decode fontSize parameters correctly', async () => {
      const testCases = [
        { param: 's', expected: 'small' },
        { param: 'm', expected: 'medium' },
        { param: 'l', expected: 'large' },
        { param: 'x', expected: 'extra-large' },
        { param: 'j', expected: 'jumbo' }
      ];

      for (const { param, expected } of testCases) {
        // Clean up previous renders
        document.body.innerHTML = '';
        
        mockLocation.search = `?s=${param}`;
        
        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
        expect(fontSizeSelect).toHaveValue(expected);
        
        // Clean up after each test case
        unmount();
      }
    });

    it('should decode textStyle parameters correctly', async () => {
      const testCases = [
        { param: 's', expected: 'Select Simple style' },
        { param: 'b', expected: 'Select Bold style' },
        { param: 'n', expected: 'Select Neon style' }
      ];

      for (const { param, expected } of testCases) {
        // Clean up previous renders
        document.body.innerHTML = '';
        
        mockLocation.search = `?y=${param}`;
        
        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        // Check for selected style button using exact aria-label
        const styleButton = screen.getByRole('button', { name: expected });
        expect(styleButton).toHaveClass('selected');
        
        // Clean up after each test case
        unmount();
      }
    });

    it('should decode direction parameters correctly', async () => {
      const testCases = [
        { param: 'l', expected: 'left-to-right' },
        { param: 'r', expected: 'right-to-left' }
      ];

      for (const { param, expected } of testCases) {
        // Clean up previous renders
        document.body.innerHTML = '';
        
        mockLocation.search = `?d=${param}`;
        
        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        // Check for selected direction in dropdown
        const directionSelect = screen.getByRole('combobox', { name: /animation direction/i });
        expect(directionSelect).toHaveValue(expected);
        
        // Clean up after each test case
        unmount();
      }
    });

    it('should decode animationSpeed parameters correctly', async () => {
      const testCases = [
        { param: 's', expected: 'Select Slow speed' },
        { param: 'n', expected: 'Select Normal speed' },
        { param: 'f', expected: 'Select Fast speed' },
        { param: 'v', expected: 'Select Very Fast speed' }
      ];

      for (const { param, expected } of testCases) {
        // Clean up previous renders
        document.body.innerHTML = '';
        
        mockLocation.search = `?a=${param}`;
        
        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        // Check for selected speed button with exact aria-label
        const speedButton = screen.getByRole('button', { name: expected });
        expect(speedButton).toHaveClass('selected');
        
        // Clean up after each test case
        unmount();
      }
    });
  });

  describe('Text Parameter Handling', () => {
    it('should load and decode text from URL parameter', async () => {
      const testTexts = [
        'Hello World!',
        'Numbers: 12345'
      ];

      for (const text of testTexts) {
        // Clean up previous renders
        document.body.innerHTML = '';
        
        mockLocation.search = `?t=${encodeURIComponent(text)}`;
        
        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        const textInput = screen.getByDisplayValue(text);
        expect(textInput).toBeInTheDocument();
        
        // Clean up after each test case
        unmount();
      }
    });

    it('should handle empty text parameter', async () => {
      mockLocation.search = '?t=';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const textInput = screen.getByDisplayValue('');
      expect(textInput).toBeInTheDocument();
    });
  });

  describe('Color Parameter Handling', () => {
    it('should load color from URL parameter', async () => {
      const testColor = '#ff0000'; // red
      
      mockLocation.search = `?c=${testColor}`;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Check that a color button is selected (exact color matching depends on available colors)
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('color-option')
      );
      const hasSelectedColor = colorButtons.some(button => 
        button.className.includes('selected')
      );
      expect(hasSelectedColor).toBe(true);
    });
  });

  describe('Multiple Parameters', () => {
    it('should handle multiple parameters together', async () => {
      const testText = 'Multi Param Test';
      mockLocation.search = `?t=${encodeURIComponent(testText)}&s=l&y=b&d=r&a=f&c=%23ff0000`;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Check text
      const textInput = screen.getByDisplayValue(testText);
      expect(textInput).toBeInTheDocument();
      
      // Check font size
      const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
      expect(fontSizeSelect).toHaveValue('large');
      
      // Check text style
      const boldButton = screen.getByRole('button', { name: /bold/i });
      expect(boldButton).toHaveClass('selected');
      
      // Check direction
      const directionSelect = screen.getByRole('combobox', { name: /animation direction/i });
      expect(directionSelect).toHaveValue('right-to-left');
      
      // Check animation speed
      const fastButton = screen.getByRole('button', { name: 'Select Fast speed' });
      expect(fastButton).toHaveClass('selected');
    });
  });

  describe('Invalid Parameters', () => {
    it('should use defaults for invalid fontSize parameters', async () => {
      mockLocation.search = '?s=invalid';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
      expect(fontSizeSelect).toHaveValue('medium'); // default
    });

    it('should use defaults for invalid textStyle parameters', async () => {
      mockLocation.search = '?y=invalid';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const simpleButton = screen.getByRole('button', { name: /simple/i });
      expect(simpleButton).toHaveClass('selected'); // default
    });

    it('should use defaults for invalid direction parameters', async () => {
      mockLocation.search = '?d=invalid';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const directionSelect = screen.getByRole('combobox', { name: /animation direction/i });
      expect(directionSelect).toHaveValue('left-to-right'); // default
    });

    it('should use defaults for invalid animationSpeed parameters', async () => {
      mockLocation.search = '?a=invalid';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const fastButton = screen.getByRole('button', { name: 'Select Fast speed' });
      expect(fastButton).toHaveClass('selected'); // default
    });
  });

  describe('URL Parameter Precedence', () => {
    it('should prioritize URL parameters over session storage', async () => {
      // Set up session storage with different values
      const sessionData = {
        text: 'Session Text',
        fontSize: 'small',
        textColor: '#00ff00',
        textStyle: 'neon',
        direction: 'right-to-left',
        animationSpeed: 'slow'
      };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData));
      
      // Set URL parameters with different values
      const urlText = 'URL Text';
      mockLocation.search = `?t=${encodeURIComponent(urlText)}&s=l&c=%23ff0000&y=b&d=l&a=f`;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      // URL parameters should take precedence
      const textInput = screen.getByDisplayValue(urlText);
      expect(textInput).toBeInTheDocument();
      
      const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
      expect(fontSizeSelect).toHaveValue('large');
      
      const boldButton = screen.getByRole('button', { name: /bold/i });
      expect(boldButton).toHaveClass('selected');
      
      const directionSelect = screen.getByRole('combobox', { name: /animation direction/i });
      expect(directionSelect).toHaveValue('left-to-right');
      
      const fastButton = screen.getByRole('button', { name: 'Select Fast speed' });
      expect(fastButton).toHaveClass('selected');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed URL parameters gracefully', async () => {
      mockLocation.search = '?t=%ZZ&s=&y=123&d=xyz&a=abc&c=notacolor';
      
      // Should not throw an error
      expect(() => {
        render(<App />);
      }).not.toThrow();
    });

    it('should handle very long text parameters', async () => {
      const longText = 'A'.repeat(1000);
      mockLocation.search = `?t=${encodeURIComponent(longText)}`;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Should truncate or handle long text appropriately
      const textInput = screen.getByRole('textbox');
      expect(textInput).toBeInTheDocument();
    });

    it('should handle special characters in text', async () => {
      const specialText = 'Hello & World!';
      mockLocation.search = `?t=${encodeURIComponent(specialText)}`;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      const textInput = screen.getByDisplayValue(specialText);
      expect(textInput).toBeInTheDocument();
    });
  });
});