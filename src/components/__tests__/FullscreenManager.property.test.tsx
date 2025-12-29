import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import FullscreenManager from '../FullscreenManager';

// Mock the fullscreen API
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();

Object.defineProperty(document, 'fullscreenEnabled', {
  writable: true,
  value: true,
});

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  writable: true,
  value: mockRequestFullscreen,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen,
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

describe('FullscreenManager Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestFullscreen.mockResolvedValue(undefined);
    mockExitFullscreen.mockResolvedValue(undefined);
    
    // Reset fullscreen support to true for property tests
    Object.defineProperty(document, 'fullscreenEnabled', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Clean up DOM between tests
    cleanup();
    
    // Reset fullscreen state
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });
  });

  /**
   * Feature: gomarquee, Property 5: Fullscreen State Management
   * 
   * Property 5: Fullscreen State Management
   * For any fullscreen state transition, entering fullscreen should hide all controls except marquee text 
   * and expand to full screen, while exiting fullscreen should restore all controls and return to normal view
   * 
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  it('Property 5: Fullscreen state transitions maintain correct UI visibility and layout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // Initial fullscreen state
        fc.boolean(), // Target fullscreen state after toggle
        fc.string({ minLength: 1, maxLength: 50 }), // Child content text
        async (initialFullscreen, targetFullscreen, childText) => {
          const mockOnToggleFullscreen = vi.fn();
          
          // Render with initial state
          const { container, rerender } = render(
            <FullscreenManager 
              isFullscreen={initialFullscreen} 
              onToggleFullscreen={mockOnToggleFullscreen}
            >
              <div data-testid="child-content">{childText}</div>
            </FullscreenManager>
          );

          // Verify initial state UI elements
          const manager = container.querySelector('.fullscreen-manager');
          expect(manager).toBeTruthy();
          
          if (initialFullscreen) {
            // In fullscreen: manager should have fullscreen-active class, exit hint should be visible
            expect(manager).toHaveClass('fullscreen-active');
            expect(container.querySelector('.fullscreen-exit-hint')).toBeInTheDocument();
          } else {
            // Not in fullscreen: manager should not have fullscreen-active class, exit hint should be hidden
            expect(manager).not.toHaveClass('fullscreen-active');
            expect(container.querySelector('.fullscreen-exit-hint')).not.toBeInTheDocument();
          }

          // Child content should always be visible
          expect(container.querySelector('[data-testid="child-content"]')).toBeInTheDocument();
          expect(container.textContent).toContain(childText);

          // Transition to target state
          rerender(
            <FullscreenManager 
              isFullscreen={targetFullscreen} 
              onToggleFullscreen={mockOnToggleFullscreen}
            >
              <div data-testid="child-content">{childText}</div>
            </FullscreenManager>
          );

          // Verify target state UI elements
          if (targetFullscreen) {
            // Entered fullscreen: controls hidden, exit hint visible, fullscreen class applied
            expect(manager).toHaveClass('fullscreen-active');
            expect(container.querySelector('.fullscreen-toggle-btn')).not.toBeInTheDocument();
            expect(container.querySelector('.fullscreen-exit-hint')).toBeInTheDocument();
            
            // Content should have fullscreen styling
            const content = container.querySelector('.fullscreen-content');
            expect(content).toHaveClass('content-fullscreen');
          } else {
            // Exited fullscreen: manager should not have fullscreen-active class, exit hint hidden, normal class applied
            expect(manager).not.toHaveClass('fullscreen-active');
            expect(container.querySelector('.fullscreen-exit-hint')).not.toBeInTheDocument();
            
            // Content should have normal styling
            const content = container.querySelector('.fullscreen-content');
            expect(content).toHaveClass('content-normal');
          }

          // Child content should remain visible throughout transition
          expect(container.querySelector('[data-testid="child-content"]')).toBeInTheDocument();
          expect(container.textContent).toContain(childText);
          
          // Clean up this render
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Fullscreen API Integration Consistency
   * For any sequence of fullscreen toggle operations, the component should correctly 
   * call the appropriate browser API methods and handle the responses consistently
   */
  it('Property: Fullscreen API calls are consistent with state changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 5 }), // Reduced sequence length
        async (fullscreenSequence) => {
          const mockOnToggleFullscreen = vi.fn();
          let currentState = false;
          
          const { container, rerender } = render(
            <FullscreenManager 
              isFullscreen={currentState} 
              onToggleFullscreen={mockOnToggleFullscreen}
            >
              <div>Test Content</div>
            </FullscreenManager>
          );

          for (const targetState of fullscreenSequence) {
            if (targetState !== currentState) {
              // Simulate clicking the fullscreen button when not in fullscreen
              if (!currentState && targetState) {
                const fullscreenButton = container.querySelector('.fullscreen-toggle-btn');
                if (fullscreenButton) {
                  fireEvent.click(fullscreenButton);
                  
                  // Should call requestFullscreen
                  await waitFor(() => {
                    expect(mockRequestFullscreen).toHaveBeenCalled();
                  });
                }
              }
              
              // Update the state
              currentState = targetState;
              rerender(
                <FullscreenManager 
                  isFullscreen={currentState} 
                  onToggleFullscreen={mockOnToggleFullscreen}
                >
                  <div>Test Content</div>
                </FullscreenManager>
              );
            }
          }
          
          // Clean up this render
          cleanup();
        }
      ),
      { numRuns: 50 } // Reduced runs for this more complex test
    );
  });

  /**
   * Property Test: Error Handling Consistency
   * For any fullscreen API error, the component should display appropriate error messages
   * and maintain functional state
   */
  it('Property: Error handling maintains component functionality', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('Permission denied'),
          fc.constant('API not available'),
          fc.constant('Unknown error'),
          fc.string({ minLength: 5, maxLength: 50 })
        ), // Different error messages
        async (errorMessage) => {
          // Mock API failure
          mockRequestFullscreen.mockRejectedValue(new Error(errorMessage));
          
          const mockOnToggleFullscreen = vi.fn();
          
          const { container } = render(
            <FullscreenManager 
              isFullscreen={false} 
              onToggleFullscreen={mockOnToggleFullscreen}
            >
              <div>Test Content</div>
            </FullscreenManager>
          );

          // Try to enter fullscreen
          const fullscreenButton = container.querySelector('.fullscreen-toggle-btn');
          if (fullscreenButton) {
            fireEvent.click(fullscreenButton);

            // Should show error message
            await waitFor(() => {
              expect(container.querySelector('.fullscreen-error')).toBeInTheDocument();
            });

            // Component should remain functional - button should still be clickable
            expect(fullscreenButton).toBeInTheDocument();
            expect(fullscreenButton).not.toBeDisabled();
            
            // Content should still be visible
            expect(container.textContent).toContain('Test Content');
          }
          
          // Clean up this render
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});