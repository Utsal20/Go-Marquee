import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MobileOptimizerProps, ViewportInfo, TouchGesture } from '../types';
import './MobileOptimizer.css';

/**
 * MobileOptimizer component handles responsive design, orientation changes,
 * touch-friendly interface optimizations, and comprehensive touch gesture support.
 * 
 * Requirements covered:
 * - 4.4: Orientation change detection and handling
 * - 4.5: Automatic text size and positioning adjustments
 * - 5.1: Touch-friendly interface elements
 * - 5.2: Responsive layout adjustments
 * - 5.3: Text readability across screen sizes
 * - 5.4: Layout adaptation within 500ms
 * - 5.5: Touch gesture support for fullscreen toggle and additional interactions
 */
const MobileOptimizer: React.FC<MobileOptimizerProps> = ({
  children,
  onViewportChange,
  onOrientationChange,
  enableTouchGestures = true,
  onGestureDetected,
}) => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    devicePixelRatio: window.devicePixelRatio || 1,
  });

  const [isOrientationChanging, setIsOrientationChanging] = useState(false);
  
  // Enhanced touch gesture state
  const [touchState, setTouchState] = useState({
    startTime: 0,
    startPosition: null as { x: number; y: number } | null,
    lastTapTime: 0,
    isLongPress: false,
    isPinching: false,
    initialDistance: 0,
    currentScale: 1,
  });

  // Refs for gesture handling
  const longPressTimer = useRef<number | null>(null);
  const gestureContainer = useRef<HTMLDivElement>(null);
  const preventScrolling = useRef(false);

  /**
   * Update viewport information and trigger callbacks
   */
  const updateViewportInfo = useCallback(() => {
    const newViewportInfo: ViewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      isMobile: window.innerWidth <= 768,
      isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    const orientationChanged = newViewportInfo.orientation !== viewportInfo.orientation;
    
    if (orientationChanged) {
      setIsOrientationChanging(true);
      onOrientationChange?.(newViewportInfo.orientation);
      
      // Clear orientation changing flag after animation completes (500ms requirement)
      setTimeout(() => {
        setIsOrientationChanging(false);
      }, 500);
    }

    setViewportInfo(newViewportInfo);
    onViewportChange?.(newViewportInfo);
  }, [viewportInfo.orientation, onViewportChange, onOrientationChange]);

  /**
   * Handle window resize with debouncing for performance
   */
  useEffect(() => {
    let resizeTimeout: number;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateViewportInfo, 100); // Debounce for performance
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial viewport setup
    updateViewportInfo();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [updateViewportInfo]);

  /**
   * Calculate distance between two touch points (for pinch gestures)
   */
  const calculateDistance = useCallback((touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Calculate velocity of gesture
   */
  const calculateVelocity = useCallback((distance: number, duration: number): number => {
    return duration > 0 ? distance / duration : 0;
  }, []);

  /**
   * Emit gesture event
   */
  const emitGesture = useCallback((gesture: TouchGesture) => {
    onGestureDetected?.(gesture);
    
    // Emit custom DOM events for backward compatibility
    const customEvent = new CustomEvent(gesture.type === 'double-tap' ? 'doubleTap' : gesture.type, {
      detail: gesture,
      bubbles: true,
    });
    
    if (gestureContainer.current) {
      gestureContainer.current.dispatchEvent(customEvent);
    }
  }, [onGestureDetected]);

  /**
   * Enhanced touch start handler
   */
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!enableTouchGestures) return;

    const touches = event.touches;
    const touch = touches[0];
    const now = Date.now();

    // Clear any existing long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touches.length === 1) {
      // Single touch - prepare for tap, swipe, or long press
      setTouchState(prev => ({
        ...prev,
        startTime: now,
        startPosition: { x: touch.clientX, y: touch.clientY },
        isLongPress: false,
        isPinching: false,
      }));

      // Set up long press detection
      longPressTimer.current = window.setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPress: true }));
        
        const longPressGesture: TouchGesture = {
          type: 'long-press',
          position: { x: touch.clientX, y: touch.clientY },
          duration: Date.now() - now,
        };
        
        emitGesture(longPressGesture);
      }, 500); // 500ms for long press

    } else if (touches.length === 2) {
      // Two touches - prepare for pinch gesture
      const distance = calculateDistance(touches[0], touches[1]);
      
      setTouchState(prev => ({
        ...prev,
        isPinching: true,
        initialDistance: distance,
        currentScale: 1,
        startTime: now,
        startPosition: {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2,
        },
      }));

      // Prevent scrolling during pinch
      preventScrolling.current = true;
      event.preventDefault();
    }
  }, [enableTouchGestures, calculateDistance, emitGesture]);

  /**
   * Enhanced touch move handler
   */
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!enableTouchGestures || !touchState.startPosition) return;

    const touches = event.touches;

    if (touches.length === 2 && touchState.isPinching) {
      // Handle pinch gesture
      const currentDistance = calculateDistance(touches[0], touches[1]);
      const scale = currentDistance / touchState.initialDistance;
      
      setTouchState(prev => ({ ...prev, currentScale: scale }));

      // Prevent scrolling during pinch
      event.preventDefault();
      
    } else if (touches.length === 1) {
      const touch = touches[0];
      const deltaX = touch.clientX - touchState.startPosition.x;
      const deltaY = touch.clientY - touchState.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If movement is significant, cancel long press
      if (distance > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Determine if we should prevent scrolling based on gesture intent
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30;
      const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30;
      
      // Only prevent scrolling for horizontal swipes or when explicitly needed
      if (isHorizontalSwipe && !isVerticalSwipe) {
        preventScrolling.current = true;
        event.preventDefault();
      } else {
        preventScrolling.current = false;
      }
    }
  }, [enableTouchGestures, touchState, calculateDistance]);

  /**
   * Enhanced touch end handler
   */
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!enableTouchGestures || !touchState.startPosition) return;

    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - touchState.startTime;
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Reset scroll prevention
    preventScrolling.current = false;

    if (touchState.isPinching) {
      // Handle pinch gesture end
      const pinchGesture: TouchGesture = {
        type: 'pinch',
        position: touchState.startPosition,
        duration,
        scale: touchState.currentScale,
      };
      
      emitGesture(pinchGesture);
      
    } else if (!touchState.isLongPress) {
      // Handle tap and swipe gestures
      const deltaX = touch.clientX - touchState.startPosition.x;
      const deltaY = touch.clientY - touchState.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = calculateVelocity(distance, duration);

      if (duration < 300 && distance < 10) {
        // Tap gesture
        const now = Date.now();
        const timeSinceLastTap = now - touchState.lastTapTime;
        
        if (timeSinceLastTap < 300) {
          // Double tap
          const doubleTapGesture: TouchGesture = {
            type: 'double-tap',
            position: { x: touch.clientX, y: touch.clientY },
            duration: timeSinceLastTap,
          };
          
          emitGesture(doubleTapGesture);
          
          // Reset last tap time to prevent triple tap
          setTouchState(prev => ({ ...prev, lastTapTime: 0 }));
        } else {
          // Single tap
          const tapGesture: TouchGesture = {
            type: 'tap',
            position: { x: touch.clientX, y: touch.clientY },
            duration,
          };
          
          emitGesture(tapGesture);
          
          // Record tap time for double tap detection
          setTouchState(prev => ({ ...prev, lastTapTime: now }));
        }
        
      } else if (duration < 500 && distance > 50) {
        // Swipe gesture
        const swipeDirection = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up');
        
        const swipeGesture: TouchGesture = {
          type: 'swipe',
          direction: swipeDirection,
          position: touchState.startPosition,
          distance,
          duration,
          velocity,
        };
        
        emitGesture(swipeGesture);
      }
    }

    // Reset touch state
    setTouchState(prev => ({
      ...prev,
      startPosition: null,
      isLongPress: false,
      isPinching: false,
      currentScale: 1,
    }));
  }, [enableTouchGestures, touchState, calculateVelocity, emitGesture]);

  /**
   * Handle touch cancel (when touch is interrupted)
   */
  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    preventScrolling.current = false;
    
    setTouchState(prev => ({
      ...prev,
      startPosition: null,
      isLongPress: false,
      isPinching: false,
      currentScale: 1,
    }));
  }, []);

  /**
   * Generate CSS custom properties for responsive design
   */
  const getResponsiveStyles = (): React.CSSProperties => {
    return {
      '--viewport-width': `${viewportInfo.width}px`,
      '--viewport-height': `${viewportInfo.height}px`,
      '--is-mobile': viewportInfo.isMobile ? '1' : '0',
      '--is-tablet': viewportInfo.isTablet ? '1' : '0',
      '--is-landscape': viewportInfo.orientation === 'landscape' ? '1' : '0',
      '--device-pixel-ratio': viewportInfo.devicePixelRatio.toString(),
      '--touch-target-size': viewportInfo.isMobile ? '48px' : '44px',
      '--content-padding': viewportInfo.isMobile 
        ? (viewportInfo.orientation === 'landscape' ? '8px' : '16px')
        : '24px',
      '--font-scale-factor': viewportInfo.isMobile ? '0.9' : '1.0',
    } as React.CSSProperties;
  };

  const containerClasses = [
    'mobile-optimizer',
    viewportInfo.isMobile ? 'mobile' : '',
    viewportInfo.isTablet ? 'tablet' : '',
    viewportInfo.orientation,
    isOrientationChanging ? 'orientation-changing' : '',
    enableTouchGestures ? 'touch-enabled' : '',
    preventScrolling.current ? 'prevent-scroll' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={gestureContainer}
      className={containerClasses}
      style={getResponsiveStyles()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Viewport meta information for debugging */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <div className="viewport-debug">
          <small>
            {viewportInfo.width}×{viewportInfo.height} | {viewportInfo.orientation} | 
            {viewportInfo.isMobile ? 'Mobile' : viewportInfo.isTablet ? 'Tablet' : 'Desktop'} |
            DPR: {viewportInfo.devicePixelRatio}
            {enableTouchGestures && ' | Touch: ON'}
          </small>
        </div>
      )}

      {/* Orientation change indicator */}
      {isOrientationChanging && (
        <div className="orientation-indicator">
          <div className="orientation-spinner"></div>
          <span>Adjusting layout...</span>
        </div>
      )}

      {/* Touch gesture feedback indicator */}
      {enableTouchGestures && touchState.isLongPress && (
        <div className="gesture-feedback long-press-feedback">
          <div className="gesture-icon">👆</div>
          <span>Long press detected</span>
        </div>
      )}

      {enableTouchGestures && touchState.isPinching && (
        <div className="gesture-feedback pinch-feedback">
          <div className="gesture-icon">🤏</div>
          <span>Scale: {touchState.currentScale.toFixed(2)}x</span>
        </div>
      )}

      {/* Main content with responsive optimizations */}
      <div className="mobile-optimized-content">
        {children}
      </div>

      {/* Touch gesture help overlay for mobile users */}
      {enableTouchGestures && viewportInfo.isMobile && (
        <div className="touch-gesture-help">
          <div className="gesture-help-item">
            <span className="gesture-icon">👆</span>
            <span>Tap</span>
          </div>
          <div className="gesture-help-item">
            <span className="gesture-icon">👆👆</span>
            <span>Double-tap for fullscreen</span>
          </div>
          <div className="gesture-help-item">
            <span className="gesture-icon">👆↕️</span>
            <span>Swipe up/down</span>
          </div>
          <div className="gesture-help-item">
            <span className="gesture-icon">👆↔️</span>
            <span>Swipe left/right</span>
          </div>
        </div>
      )}

      {/* Safe area padding for devices with notches */}
      <style>{`
        .mobile-optimizer {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .mobile-optimizer.prevent-scroll {
          overflow: hidden;
          touch-action: none;
        }
      `}</style>
    </div>
  );
};

export default MobileOptimizer;