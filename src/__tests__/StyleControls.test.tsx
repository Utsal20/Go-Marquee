import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StyleControlsComponent from '../components/StyleControlsComponent';

describe('StyleControlsComponent', () => {
  it('should render without crashing', () => {
    const mockProps = {
      fontSize: 'medium' as const,
      textColor: '#ffffff',
      textStyle: 'simple' as const,
      direction: 'left-to-right' as const,
      animationSpeed: 'fast' as const,
      onFontSizeChange: () => {},
      onColorChange: () => {},
      onStyleChange: () => {},
      onDirectionChange: () => {},
      onAnimationSpeedChange: () => {},
    };

    render(<StyleControlsComponent {...mockProps} />);
    
    expect(screen.getByText('Customize Your Text')).toBeInTheDocument();
  });

  it('should render font size select with correct value', () => {
    const mockProps = {
      fontSize: 'large' as const,
      textColor: '#ffffff',
      textStyle: 'simple' as const,
      direction: 'left-to-right' as const,
      animationSpeed: 'fast' as const,
      onFontSizeChange: () => {},
      onColorChange: () => {},
      onStyleChange: () => {},
      onDirectionChange: () => {},
      onAnimationSpeedChange: () => {},
    };

    render(<StyleControlsComponent {...mockProps} />);
    
    // The select should have the value 'large'
    const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
    expect(fontSizeSelect).toHaveValue('large');
  });
});