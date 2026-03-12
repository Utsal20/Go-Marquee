import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, FontSize, TextStyle, Direction, ViewportInfo, TouchGesture, AnimationSpeed } from './types';
import TextInputComponent from './components/TextInputComponent';
import StyleControlsComponent from './components/StyleControlsComponent';
import MarqueeDisplayComponent from './components/MarqueeDisplayComponent';
import FullscreenManager from './components/FullscreenManager';
import MobileOptimizer from './components/MobileOptimizer';
import ErrorDisplay from './components/ErrorDisplay';
import HelpPopup from './components/HelpPopup';
import { errorHandler, ErrorInfo } from './utils/ErrorHandler';

// Session storage key for persisting user preferences
const SESSION_STORAGE_KEY = 'gomarquee-preferences';

// Default state configuration
const DEFAULT_APP_STATE: AppState = {
  text: '',
  fontSize: 'medium',
  textColor: '#ffffff',
  textStyle: 'simple',
  direction: 'left-to-right',
  animationSpeed: 'fast', // Default to fast speed
  isFullscreen: false,
};

function App() {
  // Loading state for better UX
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing GoMarquee...');

  // URL parameter mappings for compact URLs
  const URL_MAPPINGS = {
    // Font size: s=small, m=medium, l=large, x=extra-large, j=jumbo
    fontSize: {
      encode: { 'small': 's', 'medium': 'm', 'large': 'l', 'extra-large': 'x', 'jumbo': 'j' },
      decode: { 's': 'small', 'm': 'medium', 'l': 'large', 'x': 'extra-large', 'j': 'jumbo' }
    },
    // Text style: s=simple, b=bold, n=neon
    textStyle: {
      encode: { 'simple': 's', 'bold': 'b', 'neon': 'n' },
      decode: { 's': 'simple', 'b': 'bold', 'n': 'neon' }
    },
    // Direction: l=left-to-right, r=right-to-left
    direction: {
      encode: { 'left-to-right': 'l', 'right-to-left': 'r' },
      decode: { 'l': 'left-to-right', 'r': 'right-to-left' }
    },
    // Animation speed: s=slow, n=normal, f=fast, v=very-fast
    animationSpeed: {
      encode: { 'slow': 's', 'normal': 'n', 'fast': 'f', 'very-fast': 'v' },
      decode: { 's': 'slow', 'n': 'normal', 'f': 'fast', 'v': 'very-fast' }
    }
  };

  // Load initial state from URL parameters or session storage or use defaults
  const loadInitialState = (): AppState => {
    try {
      // First, try to load from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlState: Partial<AppState> = {};
      
      // Parse URL parameters with short keys
      if (urlParams.has('t')) { // text
        urlState.text = decodeURIComponent(urlParams.get('t') || '');
      }
      if (urlParams.has('s')) { // fontSize (size)
        const fontSize = urlParams.get('s');
        const decodedSize = URL_MAPPINGS.fontSize.decode[fontSize as keyof typeof URL_MAPPINGS.fontSize.decode];
        if (decodedSize) {
          urlState.fontSize = decodedSize as FontSize;
        }
      }
      if (urlParams.has('c')) { // textColor (color)
        urlState.textColor = urlParams.get('c') || '#ffffff';
      }
      if (urlParams.has('y')) { // textStyle (style)
        const textStyle = urlParams.get('y');
        const decodedStyle = URL_MAPPINGS.textStyle.decode[textStyle as keyof typeof URL_MAPPINGS.textStyle.decode];
        if (decodedStyle) {
          urlState.textStyle = decodedStyle as TextStyle;
        }
      }
      if (urlParams.has('d')) { // direction
        const direction = urlParams.get('d');
        const decodedDirection = URL_MAPPINGS.direction.decode[direction as keyof typeof URL_MAPPINGS.direction.decode];
        if (decodedDirection) {
          urlState.direction = decodedDirection as Direction;
        }
      }
      if (urlParams.has('a')) { // animationSpeed (animation)
        const speed = urlParams.get('a');
        const decodedSpeed = URL_MAPPINGS.animationSpeed.decode[speed as keyof typeof URL_MAPPINGS.animationSpeed.decode];
        if (decodedSpeed) {
          urlState.animationSpeed = decodedSpeed as AnimationSpeed;
        }
      }
      if (urlParams.has('f')) { // fullscreen
        urlState.isFullscreen = urlParams.get('f') === '1';
      }
      
      // If URL parameters exist, use them and return
      if (Object.keys(urlState).length > 0) {
        return {
          ...DEFAULT_APP_STATE,
          ...urlState,
        };
      }
      
      // Otherwise, try session storage
      const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Validate that the saved state has all required properties
        return {
          ...DEFAULT_APP_STATE,
          ...parsedState,
          // Always start with fullscreen disabled for safety
          isFullscreen: false,
        };
      }
    } catch (error) {
      console.warn('Failed to load saved preferences:', error);
    }
    return DEFAULT_APP_STATE;
  };

  const [appState, setAppState] = useState<AppState>(loadInitialState);
  
  // Track if this is the initial load to avoid saving default state immediately
  const isInitialLoad = useRef(true);
  
  // Real-time update tracking for immediate visual feedback
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(Date.now());
  const [updateFeedback, setUpdateFeedback] = useState<string>('');
  
  // Help popup state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Keyboard navigation detection for accessibility
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Enhanced state update functions with immediate visual feedback
  const updateStateWithFeedback = useCallback((
    updater: (prev: AppState) => AppState,
    feedbackMessage: string
  ) => {
    setAppState(updater);
    setUpdateFeedback(feedbackMessage);
    setLastUpdateTimestamp(Date.now());
    
    // Clear feedback after a short delay
    setTimeout(() => setUpdateFeedback(''), 1000);
  }, []);

  // Enhanced event handlers with immediate feedback
  const handleTextChange = useCallback((newText: string) => {
    updateStateWithFeedback(
      prev => ({ ...prev, text: newText }),
      newText ? 'Text updated' : 'Text cleared'
    );
  }, [updateStateWithFeedback]);

  const handleFontSizeChange = useCallback((newFontSize: FontSize) => {
    updateStateWithFeedback(
      prev => ({ ...prev, fontSize: newFontSize }),
      `Font size: ${newFontSize}`
    );
  }, [updateStateWithFeedback]);

  const handleColorChange = useCallback((newColor: string) => {
    updateStateWithFeedback(
      prev => ({ ...prev, textColor: newColor }),
      'Color updated'
    );
  }, [updateStateWithFeedback]);

  const handleStyleChange = useCallback((newStyle: TextStyle) => {
    updateStateWithFeedback(
      prev => ({ ...prev, textStyle: newStyle }),
      `Style: ${newStyle}`
    );
  }, [updateStateWithFeedback]);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    updateStateWithFeedback(
      prev => ({ ...prev, direction: newDirection }),
      `Direction: ${newDirection}`
    );
  }, [updateStateWithFeedback]);

  const handleAnimationSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    updateStateWithFeedback(
      prev => ({ ...prev, animationSpeed: newSpeed }),
      `Speed: ${newSpeed}`
    );
  }, [updateStateWithFeedback]);

  const handleToggleFullscreen = useCallback(() => {
    setAppState(prev => {
      const newState = { ...prev, isFullscreen: !prev.isFullscreen };
      return newState;
    });
    // Don't show feedback for fullscreen toggle as it's visually obvious
  }, [appState.isFullscreen]);

  // Help popup handlers
  const handleOpenHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  // Generate shareable URL with current settings using short keys
  const generateShareableURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (appState.text) {
      params.set('t', encodeURIComponent(appState.text)); // text
    }
    if (appState.fontSize !== DEFAULT_APP_STATE.fontSize) {
      const encodedSize = URL_MAPPINGS.fontSize.encode[appState.fontSize];
      if (encodedSize) params.set('s', encodedSize); // size
    }
    if (appState.textColor !== DEFAULT_APP_STATE.textColor) {
      params.set('c', appState.textColor); // color
    }
    if (appState.textStyle !== DEFAULT_APP_STATE.textStyle) {
      const encodedStyle = URL_MAPPINGS.textStyle.encode[appState.textStyle];
      if (encodedStyle) params.set('y', encodedStyle); // style
    }
    if (appState.direction !== DEFAULT_APP_STATE.direction) {
      const encodedDirection = URL_MAPPINGS.direction.encode[appState.direction];
      if (encodedDirection) params.set('d', encodedDirection); // direction
    }
    if (appState.animationSpeed !== DEFAULT_APP_STATE.animationSpeed) {
      const encodedSpeed = URL_MAPPINGS.animationSpeed.encode[appState.animationSpeed];
      if (encodedSpeed) params.set('a', encodedSpeed); // animation
    }
    
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  }, [appState]);

  // Update URL when settings change (debounced)
  useEffect(() => {
    // Skip URL updates on initial load or if we loaded from URL
    if (isInitialLoad.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (appState.text) {
        params.set('t', encodeURIComponent(appState.text)); // text
      }
      if (appState.fontSize !== DEFAULT_APP_STATE.fontSize) {
        const encodedSize = URL_MAPPINGS.fontSize.encode[appState.fontSize];
        if (encodedSize) params.set('s', encodedSize); // size
      }
      if (appState.textColor !== DEFAULT_APP_STATE.textColor) {
        params.set('c', appState.textColor); // color
      }
      if (appState.textStyle !== DEFAULT_APP_STATE.textStyle) {
        const encodedStyle = URL_MAPPINGS.textStyle.encode[appState.textStyle];
        if (encodedStyle) params.set('y', encodedStyle); // style
      }
      if (appState.direction !== DEFAULT_APP_STATE.direction) {
        const encodedDirection = URL_MAPPINGS.direction.encode[appState.direction];
        if (encodedDirection) params.set('d', encodedDirection); // direction
      }
      if (appState.animationSpeed !== DEFAULT_APP_STATE.animationSpeed) {
        const encodedSpeed = URL_MAPPINGS.animationSpeed.encode[appState.animationSpeed];
        if (encodedSpeed) params.set('a', encodedSpeed); // animation
      }
      
      // Update URL without page reload
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [appState.text, appState.fontSize, appState.textColor, appState.textStyle, appState.direction, appState.animationSpeed]);

  // Copy shareable URL to clipboard
  const handleCopyShareableURL = useCallback(async () => {
    try {
      const url = generateShareableURL();
      await navigator.clipboard.writeText(url);
      setUpdateFeedback('URL copied to clipboard!');
      setTimeout(() => setUpdateFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      setUpdateFeedback('Failed to copy URL');
      setTimeout(() => setUpdateFeedback(''), 2000);
    }
  }, [generateShareableURL]);

  // Handle keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to exit fullscreen
      if (event.key === 'Escape' && appState.isFullscreen) {
        event.preventDefault();
        handleToggleFullscreen();
      }
      // Removed F key shortcut to avoid interference with typing
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [appState.isFullscreen, handleToggleFullscreen]);
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingMessage('Setting up performance optimizations...');
        
        setLoadingMessage('Finalizing setup...');
        
        // Simulate brief loading for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsLoading(false);
      } catch (error) {
        setLoadingMessage('Failed to initialize. Retrying...');
        
        // Retry after a delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    initializeApp();

    // Keyboard navigation detection for accessibility and fullscreen controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-user');
      }
      // ESC key to exit fullscreen
      if (e.key === 'Escape' && appState.isFullscreen) {
        e.preventDefault();
        handleToggleFullscreen();
      }
      // Removed F key shortcut to avoid interference with typing
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-user');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [appState.isFullscreen, handleToggleFullscreen]);

  // Handle custom fullscreen exit event from portal
  useEffect(() => {
    const handleExitFullscreen = () => {
      if (appState.isFullscreen) {
        handleToggleFullscreen();
      }
    };

    window.addEventListener('exitFullscreen', handleExitFullscreen);
    return () => window.removeEventListener('exitFullscreen', handleExitFullscreen);
  }, [appState.isFullscreen, handleToggleFullscreen]);

  // Session state persistence - save preferences whenever state changes
  useEffect(() => {
    // Skip saving on initial load to avoid overwriting with defaults
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    try {
      // Create a copy of state without fullscreen flag for persistence
      const stateToSave = {
        ...appState,
        isFullscreen: false, // Don't persist fullscreen state
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
      errorHandler.handleError(
        'SESSION_STORAGE_FAILED',
        `Failed to save preferences: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Unable to save your settings. They will be lost when you refresh the page.',
        'low',
        'general',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }, [appState]); // Only depend on appState, not feedback state

  // Mobile optimization handlers with enhanced feedback
  const handleViewportChange = useCallback((newViewportInfo: ViewportInfo) => {
    // Adjust font size based on viewport changes for better readability
    if (newViewportInfo.isMobile && appState.fontSize === 'jumbo') {
      // Reduce font size on mobile for better fit
      updateStateWithFeedback(
        prev => ({ ...prev, fontSize: 'extra-large' }),
        'Font size adjusted for mobile'
      );
    }
  }, [appState.fontSize, updateStateWithFeedback]);

  const handleOrientationChange = useCallback((orientation: 'portrait' | 'landscape') => {
    // Additional logic for orientation-specific adjustments can be added here
    
    // Provide subtle feedback for orientation changes
    setUpdateFeedback(`Orientation: ${orientation}`);
    setTimeout(() => setUpdateFeedback(''), 1000);
  }, []);

  // Enhanced touch gesture handler with immediate feedback
  const handleGestureDetected = useCallback((gesture: TouchGesture) => {
    try {
      switch (gesture.type) {
        case 'double-tap':
          // Double tap toggles fullscreen
          handleToggleFullscreen();
          setUpdateFeedback('Fullscreen toggled');
          break;
          
        case 'swipe':
          if (gesture.direction === 'up' && !appState.isFullscreen) {
            // Swipe up to enter fullscreen
            handleToggleFullscreen();
            setUpdateFeedback('Entered fullscreen');
          } else if (gesture.direction === 'down' && appState.isFullscreen) {
            // Swipe down to exit fullscreen
            handleToggleFullscreen();
            setUpdateFeedback('Exited fullscreen');
          } else if (gesture.direction === 'left') {
            // Swipe left to change direction to right-to-left
            handleDirectionChange('right-to-left');
          } else if (gesture.direction === 'right') {
            // Swipe right to change direction to left-to-right
            handleDirectionChange('left-to-right');
          }
          break;
          
        case 'long-press':
          // Long press could cycle through text styles
          const styles: TextStyle[] = ['simple', 'bold', 'neon'];
          const currentIndex = styles.indexOf(appState.textStyle);
          const nextIndex = (currentIndex + 1) % styles.length;
          handleStyleChange(styles[nextIndex]);
          break;
          
        case 'pinch':
          // Pinch gesture could adjust font size
          if (gesture.scale && gesture.scale > 1.2) {
            // Pinch out - increase font size
            const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large', 'jumbo'];
            const currentIndex = sizes.indexOf(appState.fontSize);
            if (currentIndex < sizes.length - 1) {
              handleFontSizeChange(sizes[currentIndex + 1]);
            }
          } else if (gesture.scale && gesture.scale < 0.8) {
            // Pinch in - decrease font size
            const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large', 'jumbo'];
            const currentIndex = sizes.indexOf(appState.fontSize);
            if (currentIndex > 0) {
              handleFontSizeChange(sizes[currentIndex - 1]);
            }
          }
          break;
          
        default:
          // Handle other gesture types as needed
          break;
      }
      
      // Clear feedback after gesture handling
      setTimeout(() => setUpdateFeedback(''), 1500);
    } catch (error) {
      errorHandler.handleError(
        'GESTURE_HANDLING_FAILED',
        `Failed to handle gesture: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Gesture not recognized. Please try again.',
        'low',
        'general',
        { gesture, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }, [appState.isFullscreen, appState.textStyle, appState.fontSize, handleToggleFullscreen, handleDirectionChange, handleStyleChange, handleFontSizeChange]);

  // Handle error retry
  const handleErrorRetry = useCallback((error: ErrorInfo) => {
    // Implement retry logic based on error category
    switch (error.category) {
      case 'fullscreen':
        handleToggleFullscreen();
        break;
      case 'animation':
        // Force remeasurement or restart animation
        setLastUpdateTimestamp(Date.now());
        break;
      case 'input':
        // Clear input and reset
        handleTextChange('');
        break;
      default:
        // Generic retry - refresh the page state
        setLastUpdateTimestamp(Date.now());
        break;
    }
  }, [handleToggleFullscreen, handleTextChange]);

  // Real-time update indicator for visual feedback
  const getUpdateIndicatorStyle = (): React.CSSProperties => {
    const timeSinceUpdate = Date.now() - lastUpdateTimestamp;
    const opacity = Math.max(0, 1 - (timeSinceUpdate / 1000)); // Fade out over 1 second
    
    return {
      opacity,
      transition: 'opacity 0.3s ease-out',
      color: '#4CAF50',
      fontSize: '12px',
      fontWeight: 'bold',
    };
  };

  // Loading screen component
  if (isLoading) {
    return (
      <div className="loading-state" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <span className="sr-only">Loading GoMarquee application</span>
        <span>{loadingMessage}</span>
      </div>
    );
  }

  return (
    <MobileOptimizer
      onViewportChange={handleViewportChange}
      onOrientationChange={handleOrientationChange}
      onGestureDetected={handleGestureDetected}
      enableTouchGestures={true}
    >
        <FullscreenManager
          isFullscreen={appState.isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        >
          <div 
            className={`app ${isKeyboardUser ? 'keyboard-navigation' : ''} ${appState.isFullscreen ? 'app-fullscreen' : ''}`} 
            role="application" 
            aria-label="GoMarquee"
            style={appState.isFullscreen ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999998,
              background: '#000'
            } : {}}
          >
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            
            {/* Error Display Component */}
            <ErrorDisplay
              maxErrors={3}
              autoHide={true}
              autoHideDelay={5000}
              showRetryButton={true}
              onRetry={handleErrorRetry}
              position="top"
            />
            
            {/* Hide UI controls in fullscreen mode */}
            {!appState.isFullscreen && (
              <>
                <header className="app-header" role="banner">
                  <div className="header-content">
                    <div className="header-text">
                      <h1 className="app-title">Go Marquee</h1>
                    </div>
                    <button 
                      className="help-button"
                      onClick={handleOpenHelp}
                      aria-label="Open help"
                      type="button"
                    >
                      ?
                    </button>
                  </div>
                  
                  {/* Real-time update feedback */}
                  {updateFeedback && (
                    <div 
                      className="update-feedback" 
                      style={getUpdateIndicatorStyle()}
                      role="status"
                      aria-live="polite"
                      aria-label={`Status: ${updateFeedback}`}
                    >
                      {updateFeedback}
                    </div>
                  )}
                </header>
                
                <main id="main-content" role="main">
                  {/* Text Input Section */}
                  <section className="app-section" aria-labelledby="text-input-title">
                    <h2 id="text-input-title" className="section-title">
                      Enter Your Text
                    </h2>
                    <div className="text-input-section-row">
                      <TextInputComponent
                        value={appState.text}
                        onChange={handleTextChange}
                        maxLength={500}
                      />
                      <div className="fullscreen-controls fullscreen-controls--aside">
                        <div className="fullscreen-controls-buttons">
                          <button
                            className="fullscreen-toggle-btn"
                            onClick={handleToggleFullscreen}
                            title="Fullscreen"
                            style={{
                              padding: '12px 24px',
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            ⛶ Fullscreen
                          </button>
                          <button
                            onClick={handleCopyShareableURL}
                            title="Copy shareable URL to clipboard"
                            style={{
                              padding: '12px 20px',
                              background: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            🔗 Share URL
                          </button>
                        </div>
                        <div className="mobile-gesture-hint" style={{ marginTop: '8px' }}>
                          <small style={{ color: '#888', fontSize: '12px' }}>
                            💡 Tip: Double-tap or swipe up to enter fullscreen • Share URL to save your settings
                          </small>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  {/* Style Controls Section */}
                  <section className="app-section" aria-labelledby="style-controls-title">
                    <h2 id="style-controls-title" className="section-title">
                      Customize Appearance
                    </h2>
                    
                    <StyleControlsComponent
                      fontSize={appState.fontSize}
                      textColor={appState.textColor}
                      textStyle={appState.textStyle}
                      direction={appState.direction}
                      animationSpeed={appState.animationSpeed}
                      onFontSizeChange={handleFontSizeChange}
                      onColorChange={handleColorChange}
                      onStyleChange={handleStyleChange}
                      onDirectionChange={handleDirectionChange}
                      onAnimationSpeedChange={handleAnimationSpeedChange}
                    />
                  </section>
                  
                  {/* Live Preview Section - Commented out to save space */}
                  {/* 
                  <section className="app-section" aria-labelledby="preview-title">
                    <div className="style-preview-container" style={{ 
                      padding: '20px', 
                      margin: '20px 0', 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: updateFeedback ? '2px solid #4CAF50' : '2px solid transparent',
                      transition: 'border-color 0.3s ease-out'
                    }}>
                      <div className="preview-header">
                        <h3 id="preview-title" className="preview-title">Live Preview</h3>
                        {updateFeedback && (
                          <div className="live-indicator" aria-live="polite">
                            <span className="live-dot" aria-hidden="true"></span>
                            <span className="sr-only">Live preview updating</span>
                            <span>Live</span>
                          </div>
                        )}
                      </div>
                      <div 
                        style={previewCSS} 
                        key={lastUpdateTimestamp}
                        role="img"
                        aria-label={`Preview of styled text: ${displayText}`}
                      >
                        {displayText}
                      </div>
                    </div>
                  </section>
                  */}
                  
                  {/* Instructions Section - Moved to Help Popup */}
                </main>
              </>
            )}
            
            {/* Help Popup */}
            <HelpPopup isOpen={isHelpOpen} onClose={handleCloseHelp} />
            
            {/* Marquee Display Component - Always visible */}
            <MarqueeDisplayComponent
              text={appState.text}
              fontSize={appState.fontSize}
              textColor={appState.textColor}
              textStyle={appState.textStyle}
              direction={appState.direction}
              animationSpeed={appState.animationSpeed}
              isFullscreen={appState.isFullscreen}
            />
            
            {/* Session state indicator - moved to bottom */}
            {!appState.isFullscreen && (
              <footer className="session-info" role="contentinfo">
                <span aria-label="Settings status">
                  Settings automatically saved to session
                </span>
              </footer>
            )}
          </div>
        </FullscreenManager>
      </MobileOptimizer>
  );
}

export default App;