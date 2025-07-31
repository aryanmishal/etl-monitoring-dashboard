import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock window.history.back
const mockBack = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    back: mockBack,
  },
  writable: true,
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFound Component', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('renders 404 error message', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you\'re looking for doesn\'t exist.')).toBeInTheDocument();
  });

  test('renders go to dashboard link', () => {
    renderWithRouter(<NotFound />);
    
    const dashboardLink = screen.getByText('Go to Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/');
  });

  test('renders go back button', () => {
    renderWithRouter(<NotFound />);
    
    const goBackButton = screen.getByText('← Go Back');
    expect(goBackButton).toBeInTheDocument();
  });

  test('go back button calls window.history.back', () => {
    renderWithRouter(<NotFound />);
    
    const goBackButton = screen.getByText('← Go Back');
    goBackButton.click();
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('has proper styling classes', () => {
    renderWithRouter(<NotFound />);
    
    // Check for main container classes - positioned higher at top
    const mainContainer = screen.getByText('404').closest('div');
    expect(mainContainer).toHaveClass('min-h-screen', 'w-full', 'items-start', 'pt-8');
    
    // Check for card styling with padding
    const card = screen.getByText('Go to Dashboard').closest('.login-card');
    expect(card).toHaveClass('login-card', 'dark-theme-card', 'p-8');
    
    // Check for button styling - proper width and padding
    const dashboardButton = screen.getByText('Go to Dashboard');
    expect(dashboardButton).toHaveClass('custom-button', 'dark-button', 'py-3', 'px-6', 'text-base', 'font-medium');
  });
}); 