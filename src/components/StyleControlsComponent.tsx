import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
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

  // Quick preset colors (one-tap alongside the color wheel)
  const colorPresets = [
    { value: '#ff0000', label: 'Red' },
    { value: '#0000ff', label: 'Blue' },
    { value: '#008000', label: 'Green' },
    { value: '#ffff00', label: 'Yellow' },
    { value: '#ffffff', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#ffa500', label: 'Orange' },
    { value: '#800080', label: 'Purple' },
  ];

  // Text style options as defined in design document
  const textStyleOptions: { value: TextStyle; label: string }[] = [
    { value: 'simple', label: 'Simple' },
    { value: 'bold', label: 'Bold' },
    { value: 'neon', label: 'Neon' },
  ];

  // Direction options
  const directionOptions: { value: Direction; label: string }[] = [
    { value: 'left-to-right', label: 'Left to Right' },
    { value: 'right-to-left', label: 'Right to Left' },
  ];

  // Animation speed options with emoji icons
  const speedOptions: { value: AnimationSpeed; label: string; emoji: string }[] = [
    { value: 'slow', label: 'Slow', emoji: '🐢' },
    { value: 'normal', label: 'Normal', emoji: '🐄' },
    { value: 'fast', label: 'Fast', emoji: '🐇' },
    { value: 'very-fast', label: 'Very Fast', emoji: '🐆' },
  ];

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colorPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerOpen]);

  const normalizedColor = textColor.startsWith('#') ? textColor : `#${textColor}`;

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

      {/* Color Control - Color wheel picker */}
      <div
        className={`control-group color-control-group${colorPickerOpen ? ' color-picker-open' : ''}`}
        ref={colorPickerRef}
      >
        <label className="control-label">Text Color</label>
        <div className="color-picker-row">
          <div className="color-presets">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                type="button"
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
          <div className="color-picker-wheel-wrap">
            <button
              type="button"
              className="color-picker-trigger"
              onClick={() => setColorPickerOpen((open) => !open)}
              aria-label="Choose text color"
              aria-expanded={colorPickerOpen}
              aria-haspopup="dialog"
              title="Click to open color picker"
            >
              <span
                className="color-picker-swatch"
                style={{ backgroundColor: normalizedColor }}
              />
              <span className="color-picker-hex">{normalizedColor}</span>
            </button>
            {colorPickerOpen && (
              <div className="color-picker-popover" role="dialog" aria-label="Color picker">
                <HexColorPicker
                  color={normalizedColor}
                  onChange={onColorChange}
                  className="color-wheel-picker"
                />
              </div>
            )}
          </div>
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
              aria-label={`Select ${speed.label} speed (${speed.emoji})`}
              title={speed.label}
            >
              <span className="speed-emoji" aria-hidden>{speed.emoji}</span>
              <span className="speed-label">{speed.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleControlsComponent;