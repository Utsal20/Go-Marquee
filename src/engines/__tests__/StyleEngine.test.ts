import { describe, it, expect, beforeEach } from 'vitest';
import { StyleEngine } from '../StyleEngine';
import { TextStyling } from '../../types';

describe('StyleEngine', () => {
  let styleEngine: StyleEngine;

  beforeEach(() => {
    styleEngine = new StyleEngine();
    // Mock window.innerWidth for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('generateCSS', () => {
    it('should generate basic CSS properties for simple text style', () => {
      const styling: TextStyling = {
        fontSize: 'medium',
        color: '#ffffff',
        style: 'simple',
        computedCSS: {},
      };

      const css = styleEngine.generateCSS(styling);

      expect(css.color).toBe('#ffffff');
      expect(css.fontSize).toBe('28px'); // Desktop size for medium
      expect(css.fontWeight).toBe('normal');
      expect(css.textAlign).toBe('center');
      expect(css.whiteSpace).toBe('nowrap');
    });

    it('should generate CSS with bold font weight for bold style', () => {
      const styling: TextStyling = {
        fontSize: 'large',
        color: '#ff0000',
        style: 'bold',
        computedCSS: {},
      };

      const css = styleEngine.generateCSS(styling);

      expect(css.fontWeight).toBe('bold');
      expect(css.textShadow).toBe('1px 1px 2px rgba(0, 0, 0, 0.3)');
    });

    it('should generate CSS with neon glow effect for neon style', () => {
      const styling: TextStyling = {
        fontSize: 'jumbo',
        color: '#00ff00',
        style: 'neon',
        computedCSS: {},
      };

      const css = styleEngine.generateCSS(styling);

      expect(css.textShadow).toContain('0 0 5px #00ff00');
      expect(css.textShadow).toContain('0 0 40px #00ff00');
      expect(css.filter).toBe('brightness(1.2)');
    });
  });

  describe('calculateFontSize', () => {
    it('should return mobile font size for small screens', () => {
      const fontSize = styleEngine.calculateFontSize('medium', 600);
      expect(fontSize).toBe('20px');
    });

    it('should return desktop font size for large screens', () => {
      const fontSize = styleEngine.calculateFontSize('medium', 1200);
      expect(fontSize).toBe('28px');
    });

    it('should return base font size for tablet screens', () => {
      const fontSize = styleEngine.calculateFontSize('medium', 800);
      expect(fontSize).toBe('24px');
    });

    it('should scale up font size for very large screens', () => {
      const fontSize = styleEngine.calculateFontSize('small', 2000);
      expect(fontSize).toMatch(/^21\.5\d*px$/); // 18 * 1.2, allowing for floating point precision
    });
  });

  describe('applyNeonEffect', () => {
    it('should create multiple glow layers for neon effect', () => {
      const neonCSS = styleEngine.applyNeonEffect('#ff00ff');

      expect(neonCSS.textShadow).toContain('0 0 5px #ff00ff');
      expect(neonCSS.textShadow).toContain('0 0 10px #ff00ff');
      expect(neonCSS.textShadow).toContain('0 0 15px #ff00ff');
      expect(neonCSS.textShadow).toContain('0 0 20px #ff00ff');
      expect(neonCSS.textShadow).toContain('0 0 35px #ff00ff');
      expect(neonCSS.textShadow).toContain('0 0 40px #ff00ff');
      expect(neonCSS.filter).toBe('brightness(1.2)');
    });
  });

  describe('generateCSSClass', () => {
    it('should generate proper CSS class names', () => {
      const className = styleEngine.generateCSSClass('neon', 'large');
      expect(className).toBe('marquee-text marquee-neon marquee-large');
    });
  });

  describe('generateStylesheet', () => {
    it('should generate complete CSS stylesheet string', () => {
      const styling: TextStyling = {
        fontSize: 'small',
        color: '#0000ff',
        style: 'simple',
        computedCSS: {},
      };

      const stylesheet = styleEngine.generateStylesheet(styling);

      expect(stylesheet).toContain('.marquee-text.marquee-simple.marquee-small');
      expect(stylesheet).toContain('color: #0000ff;');
      expect(stylesheet).toContain('font-size: 18px;');
    });
  });

  describe('static methods', () => {
    it('should return font size options', () => {
      const options = StyleEngine.getFontSizeOptions(1024);
      
      expect(options).toHaveLength(5);
      expect(options[0].value).toBe('small');
      expect(options[0].label).toBe('Small');
      expect(options[0].pixels).toBe('18px');
    });

    it('should return color options', () => {
      const colors = StyleEngine.getColorOptions();
      
      expect(colors).toHaveLength(16); // Updated to match expanded color options
      expect(colors.some(c => c.name === 'red')).toBe(true);
      expect(colors.some(c => c.name === 'white')).toBe(true);
      expect(colors.some(c => c.name === 'hotpink')).toBe(true);
      expect(colors.some(c => c.name === 'cyan')).toBe(true);
    });

    it('should return text style options', () => {
      const styles = StyleEngine.getTextStyleOptions();
      
      expect(styles).toHaveLength(3);
      expect(styles.some(s => s.value === 'simple')).toBe(true);
      expect(styles.some(s => s.value === 'bold')).toBe(true);
      expect(styles.some(s => s.value === 'neon')).toBe(true);
    });
  });
});