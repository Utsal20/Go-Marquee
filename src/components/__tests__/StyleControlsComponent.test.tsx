import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StyleControlsComponent from '../StyleControlsComponent';
import { FontSize, TextStyle, Direction, AnimationSpeed } from '../../types';

describe('StyleControlsComponent Unit Tests', () => {
  const defaultProps = {
    fontSize: 'medium' as FontSize,
    textColor: '#ffffff',
    textStyle: 'simple' as TextStyle,
    direction: 'left-to-right' as Direction,
    animationSpeed: 'fast' as AnimationSpeed,
    onFontSizeChange: vi.fn(),
    onColorChange: vi.fn(),
    onStyleChange: vi.fn(),
    onDirectionChange: vi.fn(),
    onAnimationSpeedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Font Size Options Availability (Requirements 2.4)', () => {
    it('should provide all required font sizes', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const fontSizeSelect = screen.getByLabelText(/font size/i);
      const options = Array.from(fontSizeSelect.querySelectorAll('option'));
      const availableSizes = options.map(option => option.value);
      
      // Requirements 2.4: At least 5 different text sizes
      expect(availableSizes).toContain('small');
      expect(availableSizes).toContain('medium');
      expect(availableSizes).toContain('large');
      expect(availableSizes).toContain('extra-large');
      expect(availableSizes).toContain('jumbo');
      expect(availableSizes.length).toBeGreaterThanOrEqual(5);
    });

    it('should display font size labels with pixel values', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const fontSizeSelect = screen.getByLabelText(/font size/i);
      
      // Check that options include both label and pixel size
      expect(fontSizeSelect).toHaveTextContent('Small (16px)');
      expect(fontSizeSelect).toHaveTextContent('Medium (24px)');
      expect(fontSizeSelect).toHaveTextContent('Large (36px)');
      expect(fontSizeSelect).toHaveTextContent('Extra Large (48px)');
      expect(fontSizeSelect).toHaveTextContent('Jumbo (72px)');
    });

    it('should call onFontSizeChange when font size is selected', () => {
      const mockOnFontSizeChange = vi.fn();
      render(<StyleControlsComponent {...defaultProps} onFontSizeChange={mockOnFontSizeChange} />);
      
      const fontSizeSelect = screen.getByLabelText(/font size/i);
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });
      
      expect(mockOnFontSizeChange).toHaveBeenCalledWith('large');
    });
  });

  describe('Color Options Availability (Requirements 2.5)', () => {
    it('should provide at least 8 different color options including primary colors and white', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('color')
      );
      
      // Requirements 2.5: At least 8 different color options including primary colors and white
      expect(colorButtons.length).toBeGreaterThanOrEqual(8);
      
      // Check for specific required colors
      expect(screen.getByLabelText('Select Red color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Blue color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Green color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Yellow color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Purple color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Orange color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select White color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Black color')).toBeInTheDocument();
    });

    it('should have mobile-friendly touch targets for color buttons', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('color')
      );
      
      // Verify color buttons exist and have proper CSS classes for mobile-friendly styling
      colorButtons.forEach(button => {
        expect(button).toHaveClass('color-option');
        // The CSS defines width: 44px and height: 44px for mobile-friendly touch targets
      });
      
      expect(colorButtons.length).toBeGreaterThanOrEqual(8);
    });

    it('should call onColorChange when color is selected', () => {
      const mockOnColorChange = vi.fn();
      render(<StyleControlsComponent {...defaultProps} onColorChange={mockOnColorChange} />);
      
      const redColorButton = screen.getByLabelText('Select Red color');
      fireEvent.click(redColorButton);
      
      expect(mockOnColorChange).toHaveBeenCalledWith('#ff0000');
    });

    it('should show selected state for current color', () => {
      render(<StyleControlsComponent {...defaultProps} textColor="#ff0000" />);
      
      const redColorButton = screen.getByLabelText('Select Red color');
      expect(redColorButton).toHaveClass('selected');
      expect(redColorButton.querySelector('.color-checkmark')).toBeInTheDocument();
    });
  });

  describe('Style Effects Implementation (Requirements 2.6)', () => {
    it('should provide all required style effects', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      // Requirements 2.6: Support neon glow effects, bold font weight, and simple clean styling
      expect(screen.getByLabelText('Select Simple style')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Bold style')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Neon style')).toBeInTheDocument();
      
      // Check that style labels are shown
      expect(screen.getByText('Simple')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Neon')).toBeInTheDocument();
    });

    it('should have mobile-friendly touch targets for style buttons', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const styleButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.match(/simple|bold|neon/i)
      );
      
      // Verify style buttons exist and have proper CSS classes for mobile-friendly styling
      styleButtons.forEach(button => {
        expect(button).toHaveClass('style-option');
        // The CSS defines min-height: 44px for mobile-friendly touch targets
      });
      
      expect(styleButtons.length).toBe(3);
    });

    it('should call onStyleChange when style is selected', () => {
      const mockOnStyleChange = vi.fn();
      render(<StyleControlsComponent {...defaultProps} onStyleChange={mockOnStyleChange} />);
      
      const boldStyleButton = screen.getByLabelText('Select Bold style');
      fireEvent.click(boldStyleButton);
      
      expect(mockOnStyleChange).toHaveBeenCalledWith('bold');
    });

    it('should show selected state for current style', () => {
      render(<StyleControlsComponent {...defaultProps} textStyle="bold" />);
      
      const boldStyleButton = screen.getByLabelText('Select Bold style');
      expect(boldStyleButton).toHaveClass('selected');
    });
  });

  describe('Direction Control', () => {
    it('should provide direction options', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const directionSelect = screen.getByLabelText(/animation direction/i);
      const options = Array.from(directionSelect.querySelectorAll('option'));
      const availableDirections = options.map(option => option.value);
      
      expect(availableDirections).toContain('left-to-right');
      expect(availableDirections).toContain('right-to-left');
    });

    it('should call onDirectionChange when direction is selected', () => {
      const mockOnDirectionChange = vi.fn();
      render(<StyleControlsComponent {...defaultProps} onDirectionChange={mockOnDirectionChange} />);
      
      const directionSelect = screen.getByLabelText(/animation direction/i);
      fireEvent.change(directionSelect, { target: { value: 'right-to-left' } });
      
      expect(mockOnDirectionChange).toHaveBeenCalledWith('right-to-left');
    });
  });

  describe('Mobile-Friendly Interface', () => {
    it('should have mobile-friendly select elements', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      const selectElements = screen.getAllByRole('combobox');
      
      selectElements.forEach(select => {
        expect(select).toHaveClass('control-select');
        // The CSS defines min-height: 44px and font-size: 16px for mobile-friendly interaction
      });
      
      expect(selectElements.length).toBe(2); // Font size and direction selects
    });

    it('should render component title', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      expect(screen.getByText('Customize Your Text')).toBeInTheDocument();
    });

    it('should have proper labels for accessibility', () => {
      render(<StyleControlsComponent {...defaultProps} />);
      
      expect(screen.getByLabelText(/font size/i)).toBeInTheDocument();
      expect(screen.getByText('Text Color')).toBeInTheDocument();
      expect(screen.getByText('Text Style')).toBeInTheDocument();
      expect(screen.getByLabelText(/animation direction/i)).toBeInTheDocument();
    });
  });
});