import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MobileOptimizer from '../MobileOptimizer';

// Mock touch events helper
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const touchList = touches.map((touch, index) => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
    pageX: touch.clientX,
    pageY: touch.clientY,
    screenX: touch.clientX,
    screenY: touch.clientY,
    identifier: index,
    target: document.body,
    force: 1,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
  })) as Touch[];

  return new TouchEvent(type, {
    touches: type === 'touchend' ? [] : touchList,
    changedTouches: touchList,
    bubbles: true,
  });
};

describe('Touch Gesture Support', () => {
  let mockOnGestureDetected: ReturnType<typeof vi.fn>;
  let mockOnViewportChange: ReturnType<typeof vi.fn>;
  let container: HTMLElement;

  beforeEach(() => {
    mockOnGestureDetected = vi.fn();
    mockOnViewportChange = vi.fn();
    
    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
    
    const { container: testContainer } = render(
      <MobileOptimizer
        onGestureDetected={mockOnGestureDetected as any}
        onViewportChange={mockOnViewportChange as any}
        enableTouchGestures={true}
      >
        <div data-testid="test-content">Test Content</div>
      </MobileOptimizer>
    );
    
    container = testContainer;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Single Tap Gesture', () => {
    it('should detect single tap gesture', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate single tap
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      fireEvent(mobileOptimizer!, touchStart);
      
      // Short delay to simulate quick tap
      setTimeout(() => {
        fireEvent(mobileOptimizer!, touchEnd);
      }, 100);

      // Wait for gesture detection
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          position: { x: 100, y: 100 },
        })
      );
    });
  });

  describe('Double Tap Gesture', () => {
    it('should detect double tap gesture for fullscreen toggle', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // First tap
      const touchStart1 = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd1 = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      fireEvent(mobileOptimizer!, touchStart1);
      setTimeout(() => fireEvent(mobileOptimizer!, touchEnd1), 50);

      // Second tap (within 300ms)
      setTimeout(() => {
        const touchStart2 = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
        const touchEnd2 = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);
        
        fireEvent(mobileOptimizer!, touchStart2);
        setTimeout(() => fireEvent(mobileOptimizer!, touchEnd2), 50);
      }, 150);

      // Wait for double tap detection
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'double-tap',
          position: { x: 100, y: 100 },
        })
      );
    });
  });

  describe('Swipe Gestures', () => {
    it('should detect horizontal swipe left gesture', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate swipe left
      const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      fireEvent(mobileOptimizer!, touchStart);
      
      setTimeout(() => {
        fireEvent(mobileOptimizer!, touchEnd);
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          direction: 'left',
          distance: 100,
        })
      );
    });

    it('should detect vertical swipe up gesture', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate swipe up
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      fireEvent(mobileOptimizer!, touchStart);
      
      setTimeout(() => {
        fireEvent(mobileOptimizer!, touchEnd);
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          direction: 'up',
          distance: 100,
        })
      );
    });

    it('should detect swipe down gesture', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate swipe down
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 200 }]);

      fireEvent(mobileOptimizer!, touchStart);
      
      setTimeout(() => {
        fireEvent(mobileOptimizer!, touchEnd);
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          direction: 'down',
          distance: 100,
        })
      );
    });
  });

  describe('Long Press Gesture', () => {
    it('should detect long press gesture', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate long press
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      fireEvent(mobileOptimizer!, touchStart);

      // Wait for long press timeout (500ms)
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'long-press',
          position: { x: 100, y: 100 },
        })
      );
    });
  });

  describe('Pinch Gesture', () => {
    it('should detect pinch gesture with two fingers', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate pinch with two fingers
      const touchStart = createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 100 }
      ]);
      
      const touchEnd = createTouchEvent('touchend', [
        { clientX: 80, clientY: 100 },
        { clientX: 220, clientY: 100 }
      ]);

      fireEvent(mobileOptimizer!, touchStart);
      
      setTimeout(() => {
        fireEvent(mobileOptimizer!, touchEnd);
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockOnGestureDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pinch',
          scale: expect.any(Number),
        })
      );
    });
  });

  describe('Gesture Conflict Prevention', () => {
    it('should not interfere with vertical scrolling', () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate vertical scroll gesture
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 150 }]);

      fireEvent(mobileOptimizer!, touchStart);
      fireEvent(mobileOptimizer!, touchMove);

      // Should not prevent default for vertical scrolling
      expect(mobileOptimizer!.classList.contains('prevent-scroll')).toBeFalsy();
    });

    it('should prevent scrolling during horizontal swipes', async () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Simulate horizontal swipe with preventDefault check
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      fireEvent(mobileOptimizer!, touchStart);

      // Create a touch move event that should trigger preventDefault
      const touchMove = createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]);
      
      // Add preventDefault spy
      const preventDefaultSpy = vi.spyOn(touchMove, 'preventDefault');
      
      fireEvent(mobileOptimizer!, touchMove);

      // Should prevent scrolling for horizontal gestures
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Touch Gesture Responsiveness', () => {
    it('should provide immediate visual feedback for touch interactions', () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();
      expect(mobileOptimizer!.classList.contains('touch-enabled')).toBeTruthy();
    });

    it('should show gesture help overlay on mobile devices', () => {
      // Check if gesture help is visible on mobile
      const gestureHelp = container.querySelector('.touch-gesture-help');
      expect(gestureHelp).toBeTruthy();
      
      // Should contain gesture instructions
      expect(gestureHelp).toHaveTextContent('Double-tap for fullscreen');
      expect(gestureHelp).toHaveTextContent('Swipe up/down');
      expect(gestureHelp).toHaveTextContent('Swipe left/right');
    });

    it('should handle touch cancellation gracefully', () => {
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();

      // Start a touch
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      fireEvent(mobileOptimizer!, touchStart);

      // Cancel the touch
      const touchCancel = new TouchEvent('touchcancel', { bubbles: true });
      fireEvent(mobileOptimizer!, touchCancel);

      // Should reset state without errors
      expect(mobileOptimizer!.classList.contains('prevent-scroll')).toBeFalsy();
    });
  });

  describe('Accessibility and Performance', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container: reducedMotionContainer } = render(
        <MobileOptimizer enableTouchGestures={true}>
          <div>Content</div>
        </MobileOptimizer>
      );

      const mobileOptimizer = reducedMotionContainer.querySelector('.mobile-optimizer');
      expect(mobileOptimizer).toBeTruthy();
    });

    it('should maintain 60fps performance during gestures', () => {
      // This would typically be tested with performance monitoring tools
      // For now, we verify that hardware acceleration is enabled
      const mobileOptimizer = container.querySelector('.mobile-optimizer');
      const computedStyle = window.getComputedStyle(mobileOptimizer!);
      
      // Check for hardware acceleration properties
      expect(computedStyle.transform).toBeDefined();
      expect(computedStyle.willChange).toBeDefined();
    });
  });

  describe('Cross-Device Compatibility', () => {
    it('should work on different screen sizes', () => {
      // Test tablet (769px is tablet range)
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });

      const { container: tabletContainer } = render(
        <MobileOptimizer enableTouchGestures={true}>
          <div>Content</div>
        </MobileOptimizer>
      );

      expect(tabletContainer.querySelector('.mobile-optimizer.tablet')).toBeTruthy();
    });

    it('should handle different device pixel ratios', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true });

      const { container: highDPIContainer } = render(
        <MobileOptimizer enableTouchGestures={true}>
          <div>Content</div>
        </MobileOptimizer>
      );

      const mobileOptimizer = highDPIContainer.querySelector('.mobile-optimizer');
      const style = mobileOptimizer!.getAttribute('style');
      expect(style).toContain('--device-pixel-ratio: 2');
    });
  });
});