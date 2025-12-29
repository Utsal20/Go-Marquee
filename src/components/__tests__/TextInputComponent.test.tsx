import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextInputComponent from '../TextInputComponent';

describe('TextInputComponent', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    maxLength: 500,
  };

  it('renders with placeholder text', () => {
    render(<TextInputComponent {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Type your message here... (up to 500 characters)')).toBeInTheDocument();
    expect(screen.getByText('0 / 500 characters')).toBeInTheDocument();
  });

  it('displays current character count', () => {
    render(<TextInputComponent {...defaultProps} value="Hello World" />);
    
    expect(screen.getByText('11 / 500 characters')).toBeInTheDocument();
  });

  it('calls onChange when valid text is entered', () => {
    const mockOnChange = vi.fn();
    render(<TextInputComponent {...defaultProps} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello World!' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Hello World!');
  });

  it('sanitizes input to remove invalid characters', () => {
    const mockOnChange = vi.fn();
    render(<TextInputComponent {...defaultProps} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    // Try to input text with invalid characters (emojis, special unicode)
    fireEvent.change(textarea, { target: { value: 'Hello 🚀 World! ñ' } });
    
    // Should only keep valid characters
    expect(mockOnChange).toHaveBeenCalledWith('Hello  World! ');
  });

  it('shows warning when approaching character limit', () => {
    const warningText = 'a'.repeat(450); // 90% of 500
    render(<TextInputComponent {...defaultProps} value={warningText} />);
    
    expect(screen.getByText('Approaching character limit')).toBeInTheDocument();
    expect(screen.getByText('450 / 500 characters')).toHaveClass('warning');
  });

  it('shows limit reached message when at maximum characters', () => {
    const maxText = 'a'.repeat(500);
    render(<TextInputComponent {...defaultProps} value={maxText} />);
    
    expect(screen.getByText('Character limit reached')).toBeInTheDocument();
    expect(screen.getByText('500 / 500 characters')).toHaveClass('at-limit');
  });

  it('prevents input when character limit is exceeded', () => {
    const mockOnChange = vi.fn();
    const maxText = 'a'.repeat(500);
    render(<TextInputComponent {...defaultProps} value={maxText} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: maxText + 'extra' } });
    
    // onChange should not be called when trying to exceed limit
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows remaining characters when close to limit', () => {
    const nearLimitText = 'a'.repeat(495); // 5 characters remaining
    render(<TextInputComponent {...defaultProps} value={nearLimitText} />);
    
    expect(screen.getByText('5 characters remaining')).toBeInTheDocument();
  });

  it('accepts alphanumeric characters, spaces, and common punctuation', () => {
    const mockOnChange = vi.fn();
    render(<TextInputComponent {...defaultProps} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    const validText = 'Hello World! 123 @#$%&*()[]{}.,;:\'"-_+=/<>?|\\~`^';
    fireEvent.change(textarea, { target: { value: validText } });
    
    expect(mockOnChange).toHaveBeenCalledWith(validText);
  });
});