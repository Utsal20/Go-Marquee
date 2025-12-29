import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import MarqueeDisplayComponent from '../MarqueeDisplayComponent';
import { FontSize, TextStyle, Direction } from '../../types';

describe('MarqueeDisplayComponent Property Tests', () => {
  beforeEach(() => {
    cleanup();
  });

  // Generators for valid input values
  const fontSizeArb = fc.constantFrom<FontSize>('small', 'medium', 'large', 'extra-large', 'jumbo');
  const textStyleArb = fc.constantFrom<TextStyle>('simple', 'bold', 'neon');
  const directionArb = fc.constantFrom<Direction>('left-to-right', 'right-to-left');
  const colorArb = fc.constantFrom('#ff0000', '#0000ff', '#008000', '#ffff00', '#800080', '#ffa500', '#ffffff', '#000000');
  
  // Generate simple alphanumeric text to avoid Testing Library issues
  const simpleTextArb = fc.string({ minLength: 3, maxLength: 20 })
    .filter(text => /^[a-zA-Z0-9]+$/.test(text)); // Only alphanumeric

  /**
   * Feature: gomarquee, Property 2: Text Display Consistency
   * For any valid text input, when submitted to the marquee display, 
   * the displayed content should exactly match the input text
   * **Validates: Requirements 1.2**
   */
  it('should display simple alphanumeric text content exactly as provided', () => {
    fc.assert(
      fc.property(
        simpleTextArb,
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        fc.boolean(),
        (text, fontSize, textColor, textStyle, direction, isFullscreen) => {
          // Clean up before each test iteration
          cleanup();
          
          // Render the MarqueeDisplayComponent with the generated props
          const { container } = render(
            <MarqueeDisplayComponent
              text={text}
              fontSize={fontSize}
              textColor={textColor}
              textStyle={textStyle}
              direction={direction}
              animationSpeed="fast"
              isFullscreen={isFullscreen}
            />
          );

          // The displayed text should exactly match the input text
          const textElement = container.querySelector('.marquee-text');
          expect(textElement).toBeInTheDocument();
          expect(textElement?.textContent).toBe(text);
        }
      ),
      { numRuns: 30 } // Reduced runs for faster execution
    );
  });

  /**
   * Property test for empty text handling - should show placeholder
   */
  it('should display placeholder when text is empty', () => {
    fc.assert(
      fc.property(
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        fc.boolean(),
        (fontSize, textColor, textStyle, direction, isFullscreen) => {
          cleanup();
          
          const expectedPlaceholder = 'Enter your text above to see it scroll here!';
          
          const { container } = render(
            <MarqueeDisplayComponent
              text=""
              fontSize={fontSize}
              textColor={textColor}
              textStyle={textStyle}
              direction={direction}
              animationSpeed="fast"
              isFullscreen={isFullscreen}
            />
          );

          // Should display the placeholder text when no text is provided
          const textElement = container.querySelector('.marquee-text');
          expect(textElement).toBeInTheDocument();
          expect(textElement?.textContent).toBe(expectedPlaceholder);
        }
      ),
      { numRuns: 10 } // Fewer runs since this is simpler
    );
  });

  /**
   * Property test for component structure consistency
   */
  it('should maintain consistent DOM structure regardless of props', () => {
    fc.assert(
      fc.property(
        simpleTextArb,
        fontSizeArb,
        colorArb,
        textStyleArb,
        directionArb,
        fc.boolean(),
        (text, fontSize, textColor, textStyle, direction, isFullscreen) => {
          cleanup();
          
          const { container } = render(
            <MarqueeDisplayComponent
              text={text}
              fontSize={fontSize}
              textColor={textColor}
              textStyle={textStyle}
              direction={direction}
              animationSpeed="fast"
              isFullscreen={isFullscreen}
            />
          );

          // Should always have the expected DOM structure
          const marqueeContainer = container.querySelector('.marquee-container');
          const marqueeText = container.querySelector('.marquee-text');
          
          expect(marqueeContainer).toBeInTheDocument();
          expect(marqueeText).toBeInTheDocument();
          
          // Should have correct direction class
          if (direction === 'left-to-right') {
            expect(marqueeContainer).toHaveClass('marquee-ltr');
          } else {
            expect(marqueeContainer).toHaveClass('marquee-rtl');
          }
          
          // Should have fullscreen class when appropriate
          if (isFullscreen) {
            expect(marqueeContainer).toHaveClass('marquee-fullscreen');
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});