import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/',
  search: '',
  pathname: '/',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('URL Parameters - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('should load text from URL parameter', async () => {
    const testText = 'Hello World!';
    mockLocation.search = `?t=${encodeURIComponent(testText)}`;
    
    render(<App />);
    
    // Wait for app to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    const textInput = screen.getByDisplayValue(testText);
    expect(textInput).toBeInTheDocument();
  });

  it('should load fontSize from URL parameter', async () => {
    mockLocation.search = '?s=l'; // large
    
    render(<App />);
    
    // Wait for app to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if the style controls section is rendered
    expect(screen.getByText('Customize Appearance')).toBeInTheDocument();
    
    // Check that the font size select has the correct value
    const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
    expect(fontSizeSelect).toHaveValue('large');
  });

  it('should load color from URL parameter', async () => {
    const testColor = '#ff0000';
    mockLocation.search = `?c=${testColor}`;
    
    render(<App />);
    
    // Wait for app to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Color is selected via button, not input - check for selected button
    const colorButton = screen.getByRole('button', { name: /select red color/i });
    expect(colorButton).toHaveClass('selected');
  });

  it('should use default values when no parameters', async () => {
    mockLocation.search = '';
    
    render(<App />);
    
    // Wait for app to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Finalizing setup...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Should use default values
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // empty text
    
    // Check font size default
    const fontSizeSelect = screen.getByRole('combobox', { name: /font size/i });
    expect(fontSizeSelect).toHaveValue('medium');
    
    // Color is selected via button - check for white color button being selected
    const whiteColorButton = screen.getByRole('button', { name: /select white color/i });
    expect(whiteColorButton).toHaveClass('selected');
  });
});