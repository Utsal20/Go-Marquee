import React from 'react';
import './HelpPopup.css';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="help-popup-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      tabIndex={-1}
    >
      <div className="help-popup-content">
        <div className="help-popup-header">
          <h2 id="help-title">How to use</h2>
          <button 
            className="help-popup-close"
            onClick={onClose}
            aria-label="Close help"
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="help-popup-body">
          <section className="help-section">
            <p className="app-description">
              Simple marquee text display app. Optimized for performance.
            </p>
          </section>
          <section className="help-section">
            <h3>Mobile Gestures</h3>
            <ul>
              <li><strong>Double-tap:</strong> Toggle fullscreen mode</li>
              <li><strong>Swipe up:</strong> Fullscreen</li>
              <li><strong>Swipe down:</strong> Exit fullscreen</li>
              <li><strong>Swipe left:</strong> Change to right-to-left direction</li>
              <li><strong>Swipe right:</strong> Change to left-to-right direction</li>
              <li><strong>Long press:</strong> Cycle through text styles (simple, bold, neon)</li>
              <li><strong>Pinch out:</strong> Increase font size</li>
              <li><strong>Pinch in:</strong> Decrease font size</li>
            </ul>
          </section>
          <section className="help-section">
            <h3>Tips & Tricks</h3>
            <ul>
              <li>Your settings are automatically saved for the current session</li>
              <li>Use keyboard navigation (Tab key) for accessibility</li>
              <li>Works great on both desktop and mobile devices</li>
            </ul>
          </section>
        </div>

        <div className="help-popup-footer">
          <button 
            className="help-popup-button"
            onClick={onClose}
            type="button"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;