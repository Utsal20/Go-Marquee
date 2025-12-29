import { CSSProperties } from 'react';
import { TextStyling, FontSize, TextStyle } from '../types';
import { handleAnimationFailure } from '../utils/ErrorHandler';

/**
 * StyleEngine class responsible for generating CSS properties and styles
 * for marquee text based on user configuration.
 */
export class StyleEngine {
  // Font size mappings in pixels for different screen widths
  private static readonly FONT_SIZE_MAP: Record<FontSize, { base: number; mobile: number; desktop: number }> = {
    small: { base: 16, mobile: 14, desktop: 18 },
    medium: { base: 24, mobile: 20, desktop: 28 },
    large: { base: 36, mobile: 30, desktop: 42 },
    'extra-large': { base: 48, mobile: 40, desktop: 56 },
    jumbo: { base: 72, mobile: 60, desktop: 84 },
  };

  // Breakpoints for responsive design
  private static readonly MOBILE_BREAKPOINT = 768;
  private static readonly DESKTOP_BREAKPOINT = 1024;

  /**
   * Generates complete CSS properties for the given text styling configuration
   * Enhanced with fullscreen mode support
   */
  generateCSS(styling: TextStyling, isFullscreen: boolean = false): CSSProperties {
    try {
      const baseCSS: CSSProperties = {
        color: styling.color,
        fontSize: this.calculateFontSize(styling.fontSize, window.innerWidth, isFullscreen),
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontWeight: this.getFontWeight(styling.style),
        textAlign: 'center',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      };

      // Apply style-specific effects
      const styleEffects = this.getStyleEffects(styling.style, styling.color);
      
      return {
        ...baseCSS,
        ...styleEffects,
      };
    } catch (error) {
      handleAnimationFailure(
        'css-generation-failed',
        error instanceof Error ? error : new Error('CSS generation failed'),
        { styling, isFullscreen }
      );
      
      // Return fallback CSS
      return {
        color: styling.color || '#ffffff',
        fontSize: isFullscreen ? '72px' : '24px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      };
    }
  }

  /**
   * Applies neon glow effect using CSS text-shadow
   */
  applyNeonEffect(baseColor: string): CSSProperties {
    try {
      // Validate color format
      if (!baseColor || typeof baseColor !== 'string') {
        throw new Error('Invalid color provided for neon effect');
      }
      
      // Create multiple layers of glow for realistic neon effect
      const glowLayers = [
        `0 0 5px ${baseColor}`,
        `0 0 10px ${baseColor}`,
        `0 0 15px ${baseColor}`,
        `0 0 20px ${baseColor}`,
        `0 0 35px ${baseColor}`,
        `0 0 40px ${baseColor}`,
      ];

      return {
        textShadow: glowLayers.join(', '),
        // Add slight brightness to the text color for neon effect
        filter: 'brightness(1.2)',
      };
    } catch (error) {
      handleAnimationFailure(
        'neon-effect-failed',
        error instanceof Error ? error : new Error('Neon effect generation failed'),
        { baseColor }
      );
      
      // Return fallback effect
      return {
        textShadow: `0 0 10px ${baseColor || '#ffffff'}`,
      };
    }
  }

  /**
   * Calculates responsive font size based on screen width
   * Enhanced with fullscreen mode support for much larger text
   */
  calculateFontSize(size: FontSize, screenWidth: number, isFullscreen: boolean = false): string {
    try {
      // Validate inputs
      if (!size || !StyleEngine.FONT_SIZE_MAP[size]) {
        throw new Error(`Invalid font size: ${size}`);
      }
      
      if (typeof screenWidth !== 'number' || screenWidth <= 0) {
        throw new Error(`Invalid screen width: ${screenWidth}`);
      }
      
      const sizeConfig = StyleEngine.FONT_SIZE_MAP[size];
      
      let fontSize: number;
      
      if (screenWidth < StyleEngine.MOBILE_BREAKPOINT) {
        // Mobile: use smaller font sizes
        fontSize = sizeConfig.mobile;
      } else if (screenWidth >= StyleEngine.DESKTOP_BREAKPOINT) {
        // Desktop: use larger font sizes
        fontSize = sizeConfig.desktop;
      } else {
        // Tablet: use base font sizes
        fontSize = sizeConfig.base;
      }

      // Apply additional scaling for very large screens
      if (screenWidth > 1920) {
        fontSize *= 1.2;
      }

      // FULLSCREEN MODE: Make text much larger to fill the screen
      if (isFullscreen) {
        // Scale up significantly for fullscreen mode
        fontSize *= 3; // Triple the size for fullscreen
        
        // Additional scaling based on screen size for fullscreen
        if (screenWidth > 1920) {
          fontSize *= 1.5; // Even larger on big screens
        } else if (screenWidth < StyleEngine.MOBILE_BREAKPOINT) {
          fontSize *= 1.2; // Slightly larger scaling on mobile
        }
      }

      return `${fontSize}px`;
    } catch (error) {
      handleAnimationFailure(
        'font-size-calculation-failed',
        error instanceof Error ? error : new Error('Font size calculation failed'),
        { size, screenWidth, isFullscreen }
      );
      
      // Return fallback font size
      return isFullscreen ? '72px' : '24px';
    }
  }

  /**
   * Generates CSS class names for different text styles
   */
  generateCSSClass(textStyle: TextStyle, fontSize: FontSize): string {
    const baseClass = 'marquee-text';
    const styleClass = `marquee-${textStyle}`;
    const sizeClass = `marquee-${fontSize}`;
    
    return `${baseClass} ${styleClass} ${sizeClass}`;
  }

  /**
   * Gets the appropriate font weight for the given text style
   */
  private getFontWeight(style: TextStyle): number | string {
    switch (style) {
      case 'bold':
        return 'bold';
      case 'neon':
        return 'normal'; // Neon effect relies on glow, not weight
      case 'simple':
      default:
        return 'normal';
    }
  }

  /**
   * Gets style-specific CSS effects
   */
  private getStyleEffects(style: TextStyle, color: string): CSSProperties {
    try {
      switch (style) {
        case 'neon':
          return this.applyNeonEffect(color);
        case 'bold':
          return {
            // Bold style might benefit from slight text shadow for better readability
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          };
        case 'simple':
        default:
          return {};
      }
    } catch (error) {
      handleAnimationFailure(
        'style-effects-failed',
        error instanceof Error ? error : new Error('Style effects generation failed'),
        { style, color }
      );
      
      // Return no effects as fallback
      return {};
    }
  }

  /**
   * Generates complete CSS stylesheet as a string for dynamic injection
   */
  generateStylesheet(styling: TextStyling): string {
    const className = this.generateCSSClass(styling.style, styling.fontSize);
    const cssProps = this.generateCSS(styling);
    
    // Convert CSSProperties to CSS string
    const cssString = Object.entries(cssProps)
      .map(([property, value]) => {
        // Convert camelCase to kebab-case
        const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${kebabProperty}: ${value};`;
      })
      .join('\n');

    return `.${className.replace(/\s+/g, '.')} {\n${cssString}\n}`;
  }

  /**
   * Gets available font size options with their pixel values
   */
  static getFontSizeOptions(screenWidth: number = window.innerWidth): Array<{
    value: FontSize;
    label: string;
    pixels: string;
  }> {
    return Object.entries(StyleEngine.FONT_SIZE_MAP).map(([size]) => {
      const fontSize = new StyleEngine().calculateFontSize(size as FontSize, screenWidth);
      return {
        value: size as FontSize,
        label: size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' '),
        pixels: fontSize,
      };
    });
  }

  /**
   * Gets available color options
   */
  static getColorOptions(): Array<{ value: string; label: string; name: string }> {
    return [
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
  }

  /**
   * Gets available text style options
   */
  static getTextStyleOptions(): Array<{
    value: TextStyle;
    label: string;
    description: string;
  }> {
    return [
      { value: 'simple', label: 'Simple', description: 'Clean, normal text' },
      { value: 'bold', label: 'Bold', description: 'Bold font weight' },
      { value: 'neon', label: 'Neon', description: 'Glowing neon effect' },
    ];
  }
}

// Export a singleton instance for convenience
export const styleEngine = new StyleEngine();