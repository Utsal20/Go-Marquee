import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { MarqueeDisplayProps, TextStyling } from '../types';
import { styleEngine, directionController } from '../engines';
import { handleAnimationFailure } from '../utils/ErrorHandler';
import './MarqueeDisplayComponent.css';

/**
 * MarqueeDisplayComponent renders animated scrolling text with customizable styling
 * and direction. Uses CSS transforms and keyframes for smooth 60fps performance.
 * Enhanced with real-time updates for immediate visual feedback.
 */
const MarqueeDisplayComponent: React.FC<MarqueeDisplayProps> = ({
  text,
  fontSize,
  textColor,
  textStyle,
  direction,
  animationSpeed,
  isFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState<number>(10);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [animationError, setAnimationError] = useState<string | null>(null);
  const [useFallbackAnimation, setUseFallbackAnimation] = useState<boolean>(false);

  // Generate styling using StyleEngine with memoization for performance
  const currentStyling: TextStyling = useMemo(() => ({
    fontSize,
    color: textColor,
    style: textStyle,
    computedCSS: {},
  }), [fontSize, textColor, textStyle]);

  const textCSS = useMemo(() => {
    try {
      return styleEngine.generateCSS(currentStyling, isFullscreen);
    } catch (error) {
      handleAnimationFailure(
        'css-generation-failed',
        error instanceof Error ? error : new Error('Unknown CSS generation error'),
        { styling: currentStyling, isFullscreen }
      );
      
      // Return fallback CSS
      return {
        color: textColor,
        fontSize: isFullscreen ? '72px' : '24px',
        fontFamily: 'Arial, sans-serif',
      };
    }
  }, [currentStyling, textColor, isFullscreen]);
  
  const displayText = text || 'Enter your text above to see it scroll here!';

  /**
   * Calculate animation duration based on text length and container width
   * Uses DirectionController for consistent speed regardless of direction
   */
  const calculateAnimationDuration = (textWidth: number, containerWidth: number): number => {
    try {
      return directionController.calculateDuration(textWidth, containerWidth);
    } catch (error) {
      handleAnimationFailure(
        'duration-calculation-failed',
        error instanceof Error ? error : new Error('Duration calculation error'),
        { textWidth, containerWidth }
      );
      
      // Return fallback duration
      return 10;
    }
  };

  /**
   * Measure text and container dimensions for animation calculations
   */
  const measureDimensions = () => {
    try {
      if (containerRef.current && textRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const textRect = textRef.current.getBoundingClientRect();
        
        const newContainerWidth = containerRect.width;
        const newTextWidth = textRect.width;
        
        // Validate dimensions
        if (newContainerWidth <= 0 || newTextWidth <= 0) {
          throw new Error('Invalid dimensions detected');
        }
        
        setContainerWidth(newContainerWidth);
        setTextWidth(newTextWidth);
        
        const newDuration = calculateAnimationDuration(newTextWidth, newContainerWidth);
        setAnimationDuration(newDuration);
        
        // Clear any previous animation errors
        if (animationError) {
          setAnimationError(null);
        }
      }
    } catch (error) {
      handleAnimationFailure(
        'dimension-measurement-failed',
        error instanceof Error ? error : new Error('Dimension measurement error'),
        { containerWidth, textWidth }
      );
      
      setAnimationError('Animation measurement failed');
      setUseFallbackAnimation(true);
      
      // Use fallback dimensions
      setContainerWidth(800);
      setTextWidth(200);
      setAnimationDuration(10);
    }
  };

  /**
   * Handle window resize to recalculate dimensions and animation
   */
  useEffect(() => {
    const handleResize = () => {
      measureDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle direction changes to ensure immediate application to running animations
   * Uses DirectionController to manage direction changes and restart animations
   */
  useEffect(() => {
    try {
      // Update direction controller and get new animation settings
      const animationSettings = directionController.updateDirection(direction, textWidth, containerWidth);
      
      // Update animation duration based on new direction settings
      setAnimationDuration(animationSettings.duration);
      
      // Force remeasurement after direction change
      const timeoutId = setTimeout(() => {
        measureDimensions();
      }, 100); // Small delay to ensure DOM updates

      return () => {
        clearTimeout(timeoutId);
      };
    } catch (error) {
      handleAnimationFailure(
        'direction-change-failed',
        error instanceof Error ? error : new Error('Direction change error'),
        { direction, textWidth, containerWidth }
      );
      
      setAnimationError('Direction change failed');
      setUseFallbackAnimation(true);
    }
  }, [direction, textWidth, containerWidth]);

  /**
   * Handle animation speed changes to ensure immediate application
   * Uses DirectionController to manage speed changes and restart animations
   */
  useEffect(() => {
    try {
      // Update speed in direction controller and get new animation settings
      const animationSettings = directionController.updateSpeed(animationSpeed, textWidth, containerWidth);
      
      // Update animation duration based on new speed settings
      setAnimationDuration(animationSettings.duration);
      
      // Force remeasurement after speed change
      const timeoutId = setTimeout(() => {
        measureDimensions();
      }, 100); // Small delay to ensure DOM updates

      return () => {
        clearTimeout(timeoutId);
      };
    } catch (error) {
      handleAnimationFailure(
        'speed-change-failed',
        error instanceof Error ? error : new Error('Speed change error'),
        { animationSpeed, textWidth, containerWidth }
      );
      
      setAnimationError('Speed change failed');
      setUseFallbackAnimation(true);
    }
  }, [animationSpeed, textWidth, containerWidth]);

  /**
   * Recalculate dimensions when text, styling, or fullscreen state changes
   * Enhanced with real-time update feedback
   */
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated with new styles
    const timeoutId = setTimeout(() => {
      measureDimensions();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, fontSize, textStyle, isFullscreen]);

  /**
   * Generate CSS custom properties for animation with direction control
   * Uses DirectionController for consistent speed and smooth transitions
   */
  const getAnimationStyles = () => {
    try {
      // Use DirectionController to generate consistent animation CSS
      const animationCSS = directionController.generateAnimationCSS(textWidth, containerWidth);
      
      return {
        ...animationCSS,
        // Fallback animation styles if needed
        ...(useFallbackAnimation && {
          animation: `fallbackScroll ${animationDuration}s linear infinite`,
        }),
      } as React.CSSProperties;
    } catch (error) {
      handleAnimationFailure(
        'css-animation-failed',
        error instanceof Error ? error : new Error('CSS animation generation error'),
        { textWidth, containerWidth, direction }
      );
      
      // Return fallback styles
      return {
        animation: `fallbackScroll ${animationDuration}s linear infinite`,
        '--animation-duration': `${animationDuration}s`,
      } as React.CSSProperties;
    }
  };

  // Get track animation styles - animates the track for seamless loop (two copies)
  const getTextAnimationStyles = () => {
    if (isFullscreen) {
      return {
        animation: `${direction === 'right-to-left' ? 'marqueeScrollRTLFullscreen' : 'marqueeScrollLTRFullscreen'} ${animationDuration}s linear infinite`,
      };
    }
    // Normal mode: animate the track so when first copy exits, second is in place (seamless)
    return {
      animation: `${direction === 'right-to-left' ? 'marqueeTrackRTL' : 'marqueeTrackLTR'} ${animationDuration}s linear infinite`,
    };
  };

  const containerClasses = [
    'marquee-container',
    isFullscreen ? 'marquee-fullscreen' : '',
    direction === 'right-to-left' ? 'marquee-rtl' : 'marquee-ltr',
  ].filter(Boolean).join(' ');

  // Create a unique key for forcing re-renders on real-time updates
  const updateKey = `${direction}-${text}-${fontSize}-${textColor}-${textStyle}-${animationSpeed}-${animationDuration}`;

  // Gap width = view width (container in normal mode, viewport in fullscreen) so separation is one full view
  const viewWidth = isFullscreen && typeof window !== 'undefined'
    ? window.innerWidth
    : containerWidth;
  const spacerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: viewWidth > 0 ? `${viewWidth}px` : '2em',
    minWidth: viewWidth > 0 ? `${viewWidth}px` : '2em',
  };

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={getAnimationStyles()}
      data-fullscreen={isFullscreen}
    >
      {/* Debug info - only show when not in fullscreen */}
      {!isFullscreen && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '3px',
          zIndex: 10
        }}>
          {containerClasses}
        </div>
      )}
      
      <div
        className="marquee-track"
        style={getTextAnimationStyles()}
        key={updateKey}
      >
        <div
          ref={textRef}
          className="marquee-text"
          style={textCSS}
          data-fullscreen={isFullscreen}
        >
          {displayText}
        </div>
        <div className="marquee-track-spacer" aria-hidden style={spacerStyle} />
        <div
          className="marquee-text"
          style={textCSS}
          data-fullscreen={isFullscreen}
          aria-hidden
        >
          {displayText}
        </div>
      </div>
      
      {/* FULLSCREEN PORTAL - Render directly to document.body to bypass all container clipping */}
      {isFullscreen && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#000000',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('exitFullscreen'));
            }
          }}
          tabIndex={0}
        >
          <div
            className="marquee-track marquee-fullscreen-track"
            style={{
              ...getAnimationStyles(),
              animation: direction === 'right-to-left'
                ? `marqueeTrackRTL ${animationDuration}s linear infinite`
                : `marqueeTrackLTR ${animationDuration}s linear infinite`,
            } as React.CSSProperties}
          >
            <div style={{
              fontSize: textCSS.fontSize || '72px',
              color: textCSS.color || textColor,
              fontWeight: textCSS.fontWeight || 'bold',
              fontFamily: textCSS.fontFamily || 'Arial, sans-serif',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textShadow: `0 0 10px ${textCSS.color || textColor}, 0 0 20px ${textCSS.color || textColor}`,
            }}>
              {displayText}
            </div>
            <div className="marquee-track-spacer" aria-hidden style={spacerStyle} />
            <div style={{
              fontSize: textCSS.fontSize || '72px',
              color: textCSS.color || textColor,
              fontWeight: textCSS.fontWeight || 'bold',
              fontFamily: textCSS.fontFamily || 'Arial, sans-serif',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textShadow: `0 0 10px ${textCSS.color || textColor}, 0 0 20px ${textCSS.color || textColor}`,
            }} aria-hidden>
              {displayText}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Animation error indicator */}
      {animationError && !isFullscreen && (
        <div className="marquee-error-indicator">
          ⚠️ {animationError}
        </div>
      )}
      
      {/* Fallback animation notice */}
      {useFallbackAnimation && !isFullscreen && (
        <div className="marquee-fallback-notice">
          Using simplified animation
        </div>
      )}
    </div>
  );
};

export default MarqueeDisplayComponent;