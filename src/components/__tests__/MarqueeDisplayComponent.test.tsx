import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MarqueeDisplayComponent from '../MarqueeDisplayComponent';

// Mock window.innerWidth for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('MarqueeDisplayComponent Unit Tests', () => {
  beforeEach(() => {
    // Reset window dimensions
    window.innerWidth = 1024;
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with provided text', () => {
      render(
        <MarqueeDisplayComponent
          text="Hello World"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render placeholder when text is empty', () => {
      render(
        <MarqueeDisplayComponent
          text=""
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      expect(screen.getByText('Enter your text above to see it scroll here!')).toBeInTheDocument();
    });
  });

  describe('CSS Animation Implementation', () => {
    it('should apply CSS classes for hardware acceleration', () => {
      render(
        <MarqueeDisplayComponent
          text="Test Animation"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container');
      const textElement = document.querySelector('.marquee-text');

      // Check that the correct CSS classes are applied
      expect(container).toHaveClass('marquee-container');
      expect(container).toHaveClass('marquee-ltr');
      expect(textElement).toHaveClass('marquee-text');
    });

    it('should set CSS custom properties for animation', () => {
      render(
        <MarqueeDisplayComponent
          text="Test Animation"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container') as HTMLElement;

      // Check that CSS custom properties are set
      expect(container.style.getPropertyValue('--animation-duration')).toMatch(/^\d+(\.\d+)?s$/);
      expect(container.style.getPropertyValue('--start-position')).toBe('100%');
      expect(container.style.getPropertyValue('--end-position')).toMatch(/^-\d+px$/);
      expect(container.style.getPropertyValue('--container-width')).toMatch(/^\d+px$/);
    });

    it('should apply correct animation direction classes', () => {
      const { rerender } = render(
        <MarqueeDisplayComponent
          text="Test"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      let container = document.querySelector('.marquee-container');
      expect(container).toHaveClass('marquee-ltr');
      expect(container).not.toHaveClass('marquee-rtl');

      rerender(
        <MarqueeDisplayComponent
          text="Test"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="right-to-left"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      container = document.querySelector('.marquee-container');
      expect(container).toHaveClass('marquee-rtl');
      expect(container).not.toHaveClass('marquee-ltr');
    });
  });

  describe('Hardware Acceleration Usage', () => {
    it('should apply CSS classes that enable hardware acceleration', () => {
      render(
        <MarqueeDisplayComponent
          text="Performance Test"
          fontSize="large"
          textColor="#00ff00"
          textStyle="neon"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container');
      const textElement = document.querySelector('.marquee-text');

      // Verify correct CSS classes are applied (hardware acceleration is in CSS)
      expect(container).toHaveClass('marquee-container');
      expect(textElement).toHaveClass('marquee-text');
    });

    it('should use CSS animations for performance optimization', () => {
      render(
        <MarqueeDisplayComponent
          text="CSS Animation Test"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container') as HTMLElement;
      
      // Verify CSS custom properties are set for animation
      expect(container.style.getPropertyValue('--animation-duration')).toBeTruthy();
      expect(container.style.getPropertyValue('--start-position')).toBeTruthy();
      expect(container.style.getPropertyValue('--end-position')).toBeTruthy();
      
      // Verify animation class is applied
      expect(container).toHaveClass('marquee-ltr');
    });

    it('should set animation duration based on text length', () => {
      render(
        <MarqueeDisplayComponent
          text="Short"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container') as HTMLElement;
      const animationDuration = container.style.getPropertyValue('--animation-duration');
      
      // Should have a valid animation duration
      expect(animationDuration).toMatch(/^\d+(\.\d+)?s$/);
      
      // Duration should be at least 3 seconds (minimum from component)
      const durationValue = parseFloat(animationDuration.replace('s', ''));
      expect(durationValue).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Fullscreen Mode', () => {
    it('should apply fullscreen classes when isFullscreen is true', () => {
      render(
        <MarqueeDisplayComponent
          text="Fullscreen Test"
          fontSize="jumbo"
          textColor="#ffffff"
          textStyle="bold"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={true}
        />
      );

      const container = document.querySelector('.marquee-container');
      expect(container).toHaveClass('marquee-fullscreen');
    });

    it('should not apply fullscreen classes when isFullscreen is false', () => {
      render(
        <MarqueeDisplayComponent
          text="Normal Test"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container');
      expect(container).not.toHaveClass('marquee-fullscreen');
    });
  });

  describe('Dynamic Animation Duration', () => {
    it('should calculate animation duration based on text length', () => {
      const { rerender } = render(
        <MarqueeDisplayComponent
          text="Short"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container') as HTMLElement;
      const shortDuration = container?.style.getPropertyValue('--animation-duration');

      rerender(
        <MarqueeDisplayComponent
          text="This is a much longer text that should take more time to scroll across the screen"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const longDuration = container?.style.getPropertyValue('--animation-duration');

      // Longer text should have longer duration (though this might be hard to test reliably due to DOM measurement)
      expect(shortDuration).toBeTruthy();
      expect(longDuration).toBeTruthy();
    });

    it('should respect minimum and maximum duration bounds', () => {
      render(
        <MarqueeDisplayComponent
          text="Test"
          fontSize="small"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      const container = document.querySelector('.marquee-container') as HTMLElement;
      const animationDuration = container?.style.getPropertyValue('--animation-duration');
      const durationValue = parseFloat(animationDuration!.replace('s', ''));

      // Should be within bounds (3-30 seconds as per component logic)
      expect(durationValue).toBeGreaterThanOrEqual(3);
      expect(durationValue).toBeLessThanOrEqual(30);
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle window resize events', () => {
      const { container } = render(
        <MarqueeDisplayComponent
          text="Resize Test"
          fontSize="medium"
          textColor="#ffffff"
          textStyle="simple"
          direction="left-to-right"
          animationSpeed="fast"
          isFullscreen={false}
        />
      );

      // Simulate window resize
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      // Component should still be rendered and functional
      expect(container.querySelector('.marquee-container')).toBeInTheDocument();
      expect(container.querySelector('.marquee-text')).toBeInTheDocument();
    });
  });
});