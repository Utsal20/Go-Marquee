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
          <h2 id="help-title">How to Use GoMarquee</h2>
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
            <h3>Getting Started</h3>
            <ul>
              <li><strong>Enter Text:</strong> Type your message in the text input field</li>
              <li><strong>Customize Style:</strong> Use the controls to change font size, color, and effects</li>
              <li><strong>Set Direction:</strong> Choose left-to-right or right-to-left scrolling</li>
              <li><strong>Adjust Speed:</strong> Select from slow, normal, fast, or very fast animation</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Fullscreen Mode</h3>
            <ul>
              <li><strong>Fullscreen:</strong> Click the fullscreen button or double-tap on mobile</li>
              <li><strong>Exit fullscreen:</strong> Press Escape, click the exit button, or swipe down on mobile</li>
              <li><strong>Fullscreen Features:</strong> Text becomes much larger and fills the entire screen</li>
            </ul>
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
            <h3>Text Styles</h3>
            <ul>
              <li><strong>Simple:</strong> Clean, normal text appearance</li>
              <li><strong>Bold:</strong> Bold font weight with subtle shadow</li>
              <li><strong>Neon:</strong> Glowing effect with multiple shadow layers</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Tips & Tricks</h3>
            <ul>
              <li>Your settings are automatically saved for the current session</li>
              <li>The app is optimized for performance and will adjust quality if needed</li>
              <li>Use keyboard navigation (Tab key) for accessibility</li>
              <li>Perfect for presentations, events, and digital signage</li>
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