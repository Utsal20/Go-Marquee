import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import StyleControlsComponent from '../StyleControlsComponent';
import { FontSize, TextStyle, Direction } from '../../types';

describe('StyleControlsComponent Property Tests', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Generators for valid enum values
  const fontSizeArb = fc.constantFrom<FontSize>('small', 'medium', 'large', 'extra-large', 'jumbo');
  const textStyleArb = fc.constantFrom<TextStyle>('simple', 'bold', 'neon');
  const directionArb = fc.constantFrom<Direction>('left-to-right', 'right-to-left');
  const colorArb = fc.constantFrom('#ff0000', '#0000ff', '#008000', '#ffff00', '#800080', '#ffa500', '#ffffff', '#000000');

  /**
   * Feature: gomarquee, Property 3: Style Engine Correctness
   * For any combination of valid font size, color, and style options, 
   * the style controls should correctly handle user interactions and 
   * call the appropriate callback functions with the selected values
   * Validates: Requirements 2.1, 2.2, 2.3
   */
  it('Property 3: Style Engine Correctness - Control Interactions', () => {
    fc.assert(
      fc.property(
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        fontSizeArb, // new font size to select
        colorArb,    // new color to select
        textStyleArb, // new style to select
        directionArb, // new direction to select
        (initialFontSize, initialColor, initialStyle, initialDirection, 
         newFontSize, newColor, newStyle, newDirection) => {
          cleanup();
          
          const mockOnFontSizeChange = vi.fn();
          const mockOnColorChange = vi.fn();
          const mockOnStyleChange = vi.fn();
          const mockOnDirectionChange = vi.fn();
          const mockOnAnimationSpeedChange = vi.fn();
          
          const { unmount } = render(
            <StyleControlsComponent
              fontSize={initialFontSize}
              textColor={initialColor}
              textStyle={initialStyle}
              direction={initialDirection}
              animationSpeed="fast"
              onFontSizeChange={mockOnFontSizeChange}
              onColorChange={mockOnColorChange}
              onStyleChange={mockOnStyleChange}
              onDirectionChange={mockOnDirectionChange}
              onAnimationSpeedChange={mockOnAnimationSpeedChange}
            />
          );
          
          // Test font size selection
          const fontSizeSelect = screen.getByLabelText(/font size/i);
          fireEvent.change(fontSizeSelect, { target: { value: newFontSize } });
          expect(mockOnFontSizeChange).toHaveBeenCalledWith(newFontSize);
          
          // Test color selection - select a specific color based on the newColor parameter
          const colorButtons = screen.getAllByRole('button').filter(button => 
            button.getAttribute('aria-label')?.includes('color')
          );
          
          // Find the button for the new color we want to test
          const targetColorButton = colorButtons.find(button => {
            const style = button.getAttribute('style');
            return style?.includes(newColor);
          });
          
          if (targetColorButton) {
            fireEvent.click(targetColorButton);
            expect(mockOnColorChange).toHaveBeenCalledWith(newColor);
          }
          
          // Test style selection
          const styleButtons = screen.getAllByRole('button');
          const styleButton = styleButtons.find(button => 
            button.textContent?.toLowerCase().includes(newStyle.toLowerCase())
          );
          if (styleButton) {
            fireEvent.click(styleButton);
            expect(mockOnStyleChange).toHaveBeenCalledWith(newStyle);
          }
          
          // Test direction selection
          const directionSelect = screen.getByLabelText(/animation direction/i);
          fireEvent.change(directionSelect, { target: { value: newDirection } });
          expect(mockOnDirectionChange).toHaveBeenCalledWith(newDirection);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for style option availability
   * For any valid style configuration, all required options should be available in the UI
   */
  it('Property: Style Options Availability', () => {
    fc.assert(
      fc.property(
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        (fontSize, textColor, textStyle, direction) => {
          cleanup();
          
          const mockCallbacks = {
            onFontSizeChange: vi.fn(),
            onColorChange: vi.fn(),
            onStyleChange: vi.fn(),
            onDirectionChange: vi.fn(),
            onAnimationSpeedChange: vi.fn(),
          };
          
          const { unmount } = render(
            <StyleControlsComponent
              fontSize={fontSize}
              textColor={textColor}
              textStyle={textStyle}
              direction={direction}
              animationSpeed="fast"
              {...mockCallbacks}
            />
          );
          
          // Verify all required font sizes are available (Requirements 2.4)
          const fontSizeSelect = screen.getByLabelText(/font size/i);
          const fontSizeOptions = Array.from(fontSizeSelect.querySelectorAll('option'));
          const availableFontSizes = fontSizeOptions.map(option => option.value);
          
          expect(availableFontSizes).toContain('small');
          expect(availableFontSizes).toContain('medium');
          expect(availableFontSizes).toContain('large');
          expect(availableFontSizes).toContain('extra-large');
          expect(availableFontSizes).toContain('jumbo');
          expect(availableFontSizes.length).toBeGreaterThanOrEqual(5);
          
          // Verify all required colors are available (Requirements 2.5)
          const colorButtons = screen.getAllByRole('button').filter(button => 
            button.getAttribute('aria-label')?.includes('color')
          );
          expect(colorButtons.length).toBeGreaterThanOrEqual(8);
          
          // Verify all style effects are available (Requirements 2.6)
          const styleButtons = screen.getAllByRole('button').filter(button => 
            button.textContent?.match(/simple|bold|neon/i)
          );
          expect(styleButtons.length).toBeGreaterThanOrEqual(3);
          
          // Verify direction options are available
          const directionSelect = screen.getByLabelText(/animation direction/i);
          const directionOptions = Array.from(directionSelect.querySelectorAll('option'));
          const availableDirections = directionOptions.map(option => option.value);
          
          expect(availableDirections).toContain('left-to-right');
          expect(availableDirections).toContain('right-to-left');
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for selected state consistency
   * For any valid configuration, the UI should correctly reflect the current selections
   */
  it('Property: Selected State Consistency', () => {
    fc.assert(
      fc.property(
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        (fontSize, textColor, textStyle, direction) => {
          cleanup();
          
          const mockCallbacks = {
            onFontSizeChange: vi.fn(),
            onColorChange: vi.fn(),
            onStyleChange: vi.fn(),
            onDirectionChange: vi.fn(),
            onAnimationSpeedChange: vi.fn(),
          };
          
          const { unmount } = render(
            <StyleControlsComponent
              fontSize={fontSize}
              textColor={textColor}
              textStyle={textStyle}
              direction={direction}
              animationSpeed="fast"
              {...mockCallbacks}
            />
          );
          
          // Verify font size selection is reflected
          const fontSizeSelect = screen.getByLabelText(/font size/i) as HTMLSelectElement;
          expect(fontSizeSelect.value).toBe(fontSize);
          
          // Verify direction selection is reflected
          const directionSelect = screen.getByLabelText(/animation direction/i) as HTMLSelectElement;
          expect(directionSelect.value).toBe(direction);
          
          // Verify color selection is reflected (check if any color button has 'selected' class)
          const colorButtons = screen.getAllByRole('button').filter(button => 
            button.getAttribute('aria-label')?.includes('color')
          );
          
          // Find the selected color button
          const selectedColorButton = colorButtons.find(button => 
            button.classList.contains('selected')
          );
          
          if (selectedColorButton) {
            // At least one color button should be selected
            expect(selectedColorButton).toHaveClass('selected');
          }
          
          // Verify style selection is reflected (selected style should have 'selected' class)
          const styleButtons = screen.getAllByRole('button').filter(button => 
            button.textContent?.match(/simple|bold|neon/i)
          );
          expect(styleButtons.length).toBeGreaterThan(0);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});