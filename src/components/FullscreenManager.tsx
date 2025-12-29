import React, { useEffect, useCallback, useState } from 'react';
import { FullscreenManagerProps } from '../types';
import { handleFullscreenFailure } from '../utils/ErrorHandler';
import './FullscreenManager.css';

const FullscreenManager: React.FC<FullscreenManagerProps> = ({
  isFullscreen,
  onToggleFullscreen,
  children
}) => {
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;

  // Check if Fullscreen API is supported
  useEffect(() => {
    const checkFullscreenSupport = () => {
      try {
        const supported = !!(
          document.fullscreenEnabled ||
          (document as any).webkitFullscreenEnabled ||
          (document as any).mozFullScreenEnabled ||
          (document as any).msFullscreenEnabled
        );
        setIsFullscreenSupported(supported);
        
        if (!supported) {
          handleFullscreenFailure(
            'not-supported',
            undefined,
            { userAgent: navigator.userAgent }
          );
        }
      } catch (error) {
        setIsFullscreenSupported(false);
        handleFullscreenFailure(
          'api-unavailable',
          error instanceof Error ? error : new Error('Unknown error'),
          { userAgent: navigator.userAgent }
        );
      }
    };

    checkFullscreenSupport();
  }, []);

  // Simplified fullscreen change handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const browserIsFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      // Only sync if there's a mismatch and we're not already syncing
      if (browserIsFullscreen !== isFullscreen && !isRetrying) {
        console.log('FullscreenManager - Syncing state:', browserIsFullscreen);
        onToggleFullscreen();
      }
    };

    const handleFullscreenError = (event: Event) => {
      console.error('Fullscreen error:', event);
      setFullscreenError('Failed to enter fullscreen mode. Please try again.');
      setTimeout(() => setFullscreenError(null), 5000);
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('fullscreenerror', handleFullscreenError);
    document.addEventListener('webkitfullscreenerror', handleFullscreenError);
    document.addEventListener('mozfullscreenerror', handleFullscreenError);
    document.addEventListener('MSFullscreenError', handleFullscreenError);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('fullscreenerror', handleFullscreenError);
      document.removeEventListener('webkitfullscreenerror', handleFullscreenError);
      document.removeEventListener('mozfullscreenerror', handleFullscreenError);
      document.removeEventListener('MSFullscreenError', handleFullscreenError);
    };
  }, [isFullscreen, onToggleFullscreen, isRetrying]);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      
      setFullscreenError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      const errorMessage = retryCount < maxRetries 
        ? `Unable to enter fullscreen mode (attempt ${retryCount + 1}/${maxRetries})`
        : 'Unable to enter fullscreen mode. Try using F11 instead.';
      
      setFullscreenError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      handleFullscreenFailure(
        'enter-failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { retryCount, maxRetries }
      );
      
      // Clear error after 5 seconds
      setTimeout(() => setFullscreenError(null), 5000);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, isRetrying]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      setFullscreenError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      const errorMessage = 'Unable to exit fullscreen mode. Press ESC to exit.';
      setFullscreenError(errorMessage);
      
      handleFullscreenFailure(
        'exit-failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { retryCount }
      );
      
      // Clear error after 5 seconds
      setTimeout(() => setFullscreenError(null), 5000);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, isRetrying]);

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    console.log('FullscreenManager - handleToggleFullscreen called');
    console.log('FullscreenManager - isFullscreenSupported:', isFullscreenSupported);
    console.log('FullscreenManager - current isFullscreen:', isFullscreen);
    
    if (!isFullscreenSupported) {
      const errorMessage = 'Fullscreen is not supported in this browser. Try using F11 instead.';
      setFullscreenError(errorMessage);
      
      handleFullscreenFailure(
        'not-supported',
        undefined,
        { userAgent: navigator.userAgent }
      );
      
      setTimeout(() => setFullscreenError(null), 5000);
      return;
    }

    if (isRetrying) {
      return; // Prevent multiple simultaneous attempts
    }

    if (isFullscreen) {
      console.log('FullscreenManager - Attempting to exit fullscreen');
      exitFullscreen();
    } else {
      console.log('FullscreenManager - Attempting to enter fullscreen');
      enterFullscreen();
    }
  }, [isFullscreen, isFullscreenSupported, enterFullscreen, exitFullscreen, isRetrying]);

  // Handle keyboard shortcuts (ESC to exit only)
  useEffect(() => {
    const handleKeyDown = () => {
      // Removed F key shortcut to avoid interference with typing
      // Only ESC key is handled for exiting fullscreen
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFullscreen]);

  // Handle touch gestures for mobile
  useEffect(() => {
    const handleDoubleTap = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        handleToggleFullscreen();
      }
    };

    const handleSwipe = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.direction === 'up' && !isFullscreen) {
        // Swipe up to enter fullscreen
        handleToggleFullscreen();
      } else if (customEvent.detail?.direction === 'down' && isFullscreen) {
        // Swipe down to exit fullscreen
        handleToggleFullscreen();
      }
    };

    document.addEventListener('doubleTap', handleDoubleTap);
    document.addEventListener('swipe', handleSwipe);

    return () => {
      document.removeEventListener('doubleTap', handleDoubleTap);
      document.removeEventListener('swipe', handleSwipe);
    };
  }, [handleToggleFullscreen, isFullscreen]);

  return (
    <div className={`fullscreen-manager ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* Error Display */}
      {fullscreenError && (
        <div className="fullscreen-error">
          <span>⚠️ {fullscreenError}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`fullscreen-content ${isFullscreen ? 'content-fullscreen' : 'content-normal'}`}>
        {children}
      </div>

      {/* Fullscreen Exit Instructions - Only shown in fullscreen */}
      {isFullscreen && (
        <div className="fullscreen-exit-hint">
          <small>Press ESC to exit fullscreen</small>
        </div>
      )}
    </div>
  );
};

export default FullscreenManager;