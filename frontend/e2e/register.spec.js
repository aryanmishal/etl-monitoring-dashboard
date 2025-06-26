import { test, expect } from '@playwright/test';

test.describe('Registration Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('Register page loads and displays form', async ({ page }) => {
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('Empty form submission shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Check for required field validation
    await expect(page.getByLabel('Email Address')).toHaveAttribute('required', '');
    await expect(page.getByLabel('Password')).toHaveAttribute('required', '');
  });

  test('Only email filled shows password required', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Password field should still show as required
    await expect(page.getByLabel('Password')).toHaveAttribute('required', '');
  });

  test('Only password filled shows email required', async ({ page }) => {
    await page.getByLabel('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Email field should still show as required
    await expect(page.getByLabel('Email Address')).toHaveAttribute('required', '');
  });

  test('Invalid email format shows validation error', async ({ page }) => {
    const emailInput = page.getByLabel('Email Address');
    
    // Fill in invalid email
    await emailInput.fill('invalid-email');
    await page.getByLabel('Password').fill('testpassword');
    
    // Submit the form
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Check that the email input is invalid
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('pattern', '[^\\s@]+@[^\\s@]+\\.[^\\s@]+');
    
    // Verify the form submission was prevented due to validation
    await expect(page.url()).toContain('/register');
  });

  test('Duplicate email shows error message', async ({ page }) => {
    // Generate a unique email for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword';

    // First registration attempt
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Wait for success message and redirect
    await expect(page.getByText('Registration successful!')).toBeVisible();
    await page.waitForURL('/login');
    
    // Go back to register page
    await page.goto('/register');
    
    // Try to register with same email
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Check for duplicate email error
    await expect(page.getByText('Username already exists')).toBeVisible();
  });

  test('Successful registration redirects to login', async ({ page }) => {
    // Generate unique email to avoid conflicts
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    await page.getByLabel('Email Address').fill(uniqueEmail);
    await page.getByLabel('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Check for success message
    await expect(page.getByText('Registration successful!')).toBeVisible();
    
    // Check for redirect to login page
    await page.waitForURL('/login');
    await expect(page.url()).toContain('/login');
  });

  test('Login link redirects to login page', async ({ page }) => {
    // Click the login link
    await page.getByRole('link', { name: 'Login' }).click();
    
    // Verify redirect to login page
    await page.waitForURL('/login');
    await expect(page.url()).toContain('/login');
    
    // Verify login page elements are visible
    await expect(page.getByLabel('Email ID')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
}); 