import React from 'react';
import { StyleControlsProps, FontSize, TextStyle, Direction, AnimationSpeed } from '../types';
import './StyleControlsComponent.css';

const StyleControlsComponent: React.FC<StyleControlsProps> = ({
  fontSize,
  textColor,
  textStyle,
  direction,
  animationSpeed,
  onFontSizeChange,
  onColorChange,
  onStyleChange,
  onDirectionChange,
  onAnimationSpeedChange,
}) => {
  // Font size options as defined in design document
  const fontSizeOptions: { value: FontSize; label: string; size: string }[] = [
    { value: 'small', label: 'Small', size: '16px' },
    { value: 'medium', label: 'Medium', size: '24px' },
    { value: 'large', label: 'Large', size: '36px' },
    { value: 'extra-large', label: 'Extra Large', size: '48px' },
    { value: 'jumbo', label: 'Jumbo', size: '72px' },
  ];

  // Expanded color options with more variety
  const colorOptions = [
    { value: '#ff0000', label: 'Red', name: 'red' },
    { value: '#0000ff', label: 'Blue', name: 'blue' },
    { value: '#008000', label: 'Green', name: 'green' },
    { value: '#ffff00', label: 'Yellow', name: 'yellow' },
    { value: '#800080', label: 'Purple', name: 'purple' },
    { value: '#ffa500', label: 'Orange', name: 'orange' },
    { value: '#ffffff', label: 'White', name: 'white' },
    { value: '#000000', label: 'Black', name: 'black' },
    { value: '#ff69b4', label: 'Hot Pink', name: 'hotpink' },
    { value: '#00ffff', label: 'Cyan', name: 'cyan' },
    { value: '#ff1493', label: 'Deep Pink', name: 'deeppink' },
    { value: '#32cd32', label: 'Lime Green', name: 'limegreen' },
    { value: '#ff4500', label: 'Orange Red', name: 'orangered' },
    { value: '#9370db', label: 'Medium Purple', name: 'mediumpurple' },
    { value: '#00fa9a', label: 'Medium Spring Green', name: 'mediumspringgreen' },
    { value: '#ffd700', label: 'Gold', name: 'gold' },
  ];

  // Text style options as defined in design document
  const textStyleOptions: { value: TextStyle; label: string; description: string }[] = [
    { value: 'simple', label: 'Simple', description: 'Clean, normal text' },
    { value: 'bold', label: 'Bold', description: 'Bold font weight' },
    { value: 'neon', label: 'Neon', description: 'Glowing neon effect' },
  ];

  // Direction options
  const directionOptions: { value: Direction; label: string }[] = [
    { value: 'left-to-right', label: 'Left to Right' },
    { value: 'right-to-left', label: 'Right to Left' },
  ];

  // Animation speed options
  const speedOptions: { value: AnimationSpeed; label: string; description: string }[] = [
    { value: 'slow', label: 'Slow', description: 'Relaxed pace' },
    { value: 'normal', label: 'Normal', description: 'Standard speed' },
    { value: 'fast', label: 'Fast', description: 'Quick movement' },
    { value: 'very-fast', label: 'Very Fast', description: 'Rapid scrolling' },
  ];

  return (
    <div className="style-controls">
      <h3 className="style-controls-title">Customize Your Text</h3>
      
      {/* Font Size and Direction Controls - Same row on large screens */}
      <div className="responsive-row">
        <div className="control-group">
          <label htmlFor="font-size-select" className="control-label">
            Font Size
          </label>
          <select
            id="font-size-select"
            className="control-select"
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value as FontSize)}
          >
            {fontSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.size})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="direction-select" className="control-label">
            Animation Direction
          </label>
          <select
            id="direction-select"
            className="control-select"
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value as Direction)}
          >
            {directionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Control */}
      <div className="control-group">
        <label className="control-label">Text Color</label>
        <div className="color-picker-grid">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`color-option ${textColor === color.value ? 'selected' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => onColorChange(color.value)}
              aria-label={`Select ${color.label} color`}
              title={color.label}
            >
              {textColor === color.value && (
                <span className="color-checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Text Style Control */}
      <div className="control-group">
        <label className="control-label">Text Style</label>
        <div className="style-options">
          {textStyleOptions.map((style) => (
            <button
              key={style.value}
              className={`style-option ${textStyle === style.value ? 'selected' : ''}`}
              onClick={() => onStyleChange(style.value)}
              aria-label={`Select ${style.label} style`}
            >
              <span className="style-label">{style.label}</span>
              <span className="style-description">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Speed Control */}
      <div className="control-group">
        <label className="control-label">Animation Speed</label>
        <div className="speed-options">
          {speedOptions.map((speed) => (
            <button
              key={speed.value}
              className={`speed-option ${animationSpeed === speed.value ? 'selected' : ''}`}
              onClick={() => onAnimationSpeedChange(speed.value)}
              aria-label={`Select ${speed.label} speed`}
            >
              <span className="speed-label">{speed.label}</span>
              <span className="speed-description">{speed.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleControlsComponent;