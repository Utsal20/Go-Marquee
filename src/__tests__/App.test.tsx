import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import App from '../App';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
  },
});

describe('App Component - Real-time Updates and State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('should render the app with real-time features', async () => {
    render(<App />);

    // Initially should show loading screen
    expect(screen.getByText('Loading GoMarquee application')).toBeInTheDocument();
    expect(screen.getByText('Finalizing setup...')).toBeInTheDocument();

    // Wait for loading to complete and main app to render
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if key elements are present after loading
    expect(screen.getByText('Settings automatically saved to session')).toBeInTheDocument();
    // Live Preview section was commented out, so don't test for it
    // expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('should load saved state from session storage', async () => {
    const savedState = {
      text: 'Saved text',
      fontSize: 'large',
      textColor: '#ff0000',
      textStyle: 'bold',
      direction: 'right-to-left',
    };

    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if the saved text is displayed
    await waitFor(() => {
      expect(screen.getByDisplayValue('Saved text')).toBeInTheDocument();
    });
  });

  it('should handle session storage gracefully when no saved state exists', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should render with default state - check for placeholder text
    // The placeholder text was removed when Live Preview was commented out
    // expect(screen.getByText('Enter your text above to see it styled here!')).toBeInTheDocument();
  });
});

describe('App Component - Initial UI State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('should present clean interface on application load', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for clean, uncluttered interface elements
    expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    expect(screen.getByText('Customizable Scrolling Text')).toBeInTheDocument();
    expect(screen.getByText('Create beautiful scrolling marquee displays with real-time styling controls. Perfect for presentations, events, and digital signage.')).toBeInTheDocument();

    // Check for proper section organization
    expect(screen.getByText('Enter Your Text')).toBeInTheDocument();
    expect(screen.getByText('Customize Appearance')).toBeInTheDocument();
    // Live Preview section was commented out, so don't test for it
    // expect(screen.getByText('Live Preview')).toBeInTheDocument();
    // Help is now in a popup, check for help button instead
    expect(screen.getByRole('button', { name: /open help/i })).toBeInTheDocument();

    // Check for accessibility elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer

    // Skip link is hidden for now as requested
    // expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should display default placeholder message in preview', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for default placeholder message
    // The placeholder text was removed when Live Preview was commented out
    // expect(screen.getByText('Enter your text above to see it styled here!')).toBeInTheDocument();
  });

  it('should have proper loading state with accessibility attributes', () => {
    render(<App />);

    // Check loading screen accessibility
    const loadingScreen = screen.getByRole('status');
    expect(loadingScreen).toBeInTheDocument();
    expect(loadingScreen).toHaveAttribute('aria-live', 'polite');

    // Check for screen reader text
    expect(screen.getByText('Loading GoMarquee application')).toBeInTheDocument();
    
    // Check for loading spinner with proper accessibility
    const spinner = loadingScreen.querySelector('.loading-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have proper semantic HTML structure', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for proper semantic structure
    const app = screen.getByRole('application');
    expect(app).toHaveAttribute('aria-label', 'GoMarquee - Customizable Scrolling Text');

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Go Marquee');

    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(2); // Enter Your Text, Customize Appearance (How to Use moved to popup, Live Preview is h3)

    // Check for proper section labeling
    const textInputSection = screen.getByLabelText('Enter Your Text');
    expect(textInputSection).toBeInTheDocument();

    const styleControlsSection = screen.getByLabelText('Customize Appearance');
    expect(styleControlsSection).toBeInTheDocument();

    // How to Use section was moved to help popup, so we don't check for it here
  });

  it('should have keyboard navigation support', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Skip link is hidden for now as requested
    // const skipLink = screen.getByText('Skip to main content');
    // expect(skipLink).toHaveAttribute('href', '#main-content');

    // Check that main content has proper ID for skip link
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('id', 'main-content');

    // Check for proper focus management elements
    const focusableElements = screen.getAllByRole('textbox').concat(
      screen.getAllByRole('button'),
      screen.getAllByRole('combobox')
    );
    
    // Should have at least some focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('should display instructions for user guidance', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for help button instead of inline instructions (instructions moved to popup)
    const helpButton = screen.getByRole('button', { name: /open help/i });
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toHaveAttribute('title', 'How to use GoMarquee');
    
    // Check that help button is accessible
    expect(helpButton).toHaveAttribute('aria-label', 'Open help');
  });

  it('should have proper visual hierarchy with clean design', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Go Marquee')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for proper CSS classes that indicate clean design
    const appContainer = screen.getByRole('application');
    expect(appContainer).toHaveClass('app');

    // Check for section containers with clean styling
    const sections = screen.getAllByRole('region');
    sections.forEach(section => {
      expect(section).toHaveClass('app-section');
    });

    // Check for proper header structure
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('app-header');

    // Check for session info styling
    const sessionInfo = screen.getByText('Settings automatically saved to session');
    expect(sessionInfo.parentElement).toHaveClass('session-info');
  });
});