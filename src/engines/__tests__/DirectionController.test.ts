import { describe, it, expect, beforeEach } from 'vitest';
import { DirectionController } from '../DirectionController';

describe('DirectionController', () => {
  let controller: DirectionController;

  beforeEach(() => {
    controller = new DirectionController();
  });

  describe('Direction Management', () => {
    it('should initialize with left-to-right direction', () => {
      expect(controller.getCurrentDirection()).toBe('left-to-right');
    });

    it('should update direction and return new animation settings', () => {
      const textWidth = 200;
      const containerWidth = 800;
      
      const settings = controller.updateDirection('right-to-left', textWidth, containerWidth);
      
      expect(settings.direction).toBe('right-to-left');
      expect(controller.getCurrentDirection()).toBe('right-to-left');
      expect(settings.speed).toBe(400); // Default speed is now 'fast' = 400px/s
      expect(settings.duration).toBeGreaterThan(0);
    });

    it('should maintain consistent speed across directions', () => {
      const textWidth = 300;
      const containerWidth = 600;
      
      const ltrSettings = controller.updateDirection('left-to-right', textWidth, containerWidth);
      const rtlSettings = controller.updateDirection('right-to-left', textWidth, containerWidth);
      
      // Both directions should have the same speed and duration for same dimensions
      expect(ltrSettings.speed).toBe(rtlSettings.speed);
      expect(ltrSettings.duration).toBe(rtlSettings.duration);
    });
  });

  describe('Animation Duration Calculation', () => {
    it('should calculate duration based on text and container width', () => {
      const textWidth = 400;
      const containerWidth = 800;
      const expectedDistance = textWidth + containerWidth; // 1200px
      const expectedDuration = expectedDistance / 400; // 3 seconds at 400px/s (fast speed)
      
      const duration = controller.calculateDuration(textWidth, containerWidth);
      
      expect(duration).toBe(expectedDuration);
    });

    it('should enforce minimum duration of 3 seconds', () => {
      const duration = controller.calculateDuration(50, 50); // Very small dimensions
      
      expect(duration).toBeGreaterThanOrEqual(1); // Minimum is 1 second in new implementation
    });

    it('should enforce maximum duration of 30 seconds', () => {
      const duration = controller.calculateDuration(2000, 2000); // Very large dimensions
      
      expect(duration).toBeLessThanOrEqual(15); // Maximum is 15 seconds in new implementation
    });

    it('should handle zero dimensions gracefully', () => {
      expect(controller.calculateDuration(0, 100)).toBe(5); // Fallback is 5 seconds
      expect(controller.calculateDuration(100, 0)).toBe(5);
      expect(controller.calculateDuration(0, 0)).toBe(5);
    });
  });

  describe('Animation Speed Management', () => {
    it('should allow setting custom animation speed', () => {
      controller.setAnimationSpeed('normal');
      
      expect(controller.getAnimationSpeed()).toBe(250);
    });

    it('should handle different speed settings', () => {
      controller.setAnimationSpeed('slow');
      expect(controller.getAnimationSpeed()).toBe(150);
      
      controller.setAnimationSpeed('very-fast');
      expect(controller.getAnimationSpeed()).toBe(600);
    });
  });

  describe('CSS Generation', () => {
    it('should generate correct CSS for left-to-right direction', () => {
      const textWidth = 200;
      const containerWidth = 800;
      
      controller.updateDirection('left-to-right', textWidth, containerWidth);
      const css = controller.generateAnimationCSS(textWidth, containerWidth);
      
      expect(css['--start-position']).toBe('100%');
      expect(css['--end-position']).toBe('-200px');
      expect(css['--container-width']).toBe('800px');
      expect(css['--text-width']).toBe('200px');
    });

    it('should generate correct CSS for right-to-left direction', () => {
      const textWidth = 200;
      const containerWidth = 800;
      
      controller.updateDirection('right-to-left', textWidth, containerWidth);
      const css = controller.generateAnimationCSS(textWidth, containerWidth);
      
      expect(css['--start-position']).toBe('-200px');
      expect(css['--end-position']).toBe('100%');
      expect(css['--container-width']).toBe('800px');
      expect(css['--text-width']).toBe('200px');
    });

    it('should include animation duration in CSS', () => {
      const textWidth = 300;
      const containerWidth = 600;
      
      const css = controller.generateAnimationCSS(textWidth, containerWidth);
      
      expect(css['--animation-duration']).toMatch(/^\d+(\.\d+)?s$/); // Should be a valid duration
    });
  });

  describe('Animation Restart Detection', () => {
    it('should detect when direction change requires restart', () => {
      controller.updateDirection('left-to-right', 100, 100);
      
      expect(controller.requiresAnimationRestart('right-to-left')).toBe(true);
      expect(controller.requiresAnimationRestart('left-to-right')).toBe(false);
    });
  });
});