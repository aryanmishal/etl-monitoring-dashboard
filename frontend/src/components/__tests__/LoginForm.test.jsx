import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';

// Setup test environment
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  it('renders login form', () => {
    renderWithRouter(<LoginForm />);
    
    expect(screen.getByLabelText(/email id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits form with valid credentials', async () => {
    const mockOnSubmit = vi.fn();
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Type valid credentials
    const emailInput = screen.getByLabelText(/email id/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
    });
    
    // Submit form
    const loginButton = screen.getByRole('button', { name: /login/i });
    await act(async () => {
      await user.click(loginButton);
    });

    // Wait for and verify form submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    }, { timeout: 3000 });
  });
}); 