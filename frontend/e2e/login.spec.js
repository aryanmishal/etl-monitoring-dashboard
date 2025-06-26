import { test, expect } from '@playwright/test';

const VALID_EMAIL = 'testing@gmail.com';
const VALID_PASSWORD = 'testpassword';
const INVALID_PASSWORD = 'wrongpassword';
const UNREGISTERED_EMAIL = 'notregistered@example.com';

test('Login page loads and displays form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email ID')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('Shows error for correct email and wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(VALID_EMAIL);
  await page.getByLabel('Password').fill(INVALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});

test('Shows error for unregistered email and correct password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(UNREGISTERED_EMAIL);
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});

test('Shows error for unregistered email and wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(UNREGISTERED_EMAIL);
  await page.getByLabel('Password').fill(INVALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});

test('Shows browser validation for invalid email format', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill('invalidemail'); // no @
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  // Try to submit and check that the form is not submitted
  await page.getByRole('button', { name: 'Login' }).click();
  // The browser should prevent submission, so the error message should not appear
  await expect(page.getByText(/invalid credentials/i)).not.toBeVisible();
  // Optionally, check for the browser's validation popup (not always possible in headless mode)
  // Instead, check that we are still on the login page
  await expect(page).toHaveURL(/\/login/);
});

test('Shows browser validation when both fields are empty', async ({ page }) => {
  await page.goto('/login');
  // Do not fill any fields
  await page.getByRole('button', { name: 'Login' }).click();
  // Should remain on login page and not show backend error
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/invalid credentials/i)).not.toBeVisible();
});

test('Shows browser validation when password is empty', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(VALID_EMAIL);
  // Leave password empty
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/invalid credentials/i)).not.toBeVisible();
});

test('Shows browser validation when email is empty', async ({ page }) => {
  await page.goto('/login');
  // Leave email empty
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/invalid credentials/i)).not.toBeVisible();
});

test('Successful login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(VALID_EMAIL);
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  // Wait for redirect to any dashboard page
  await page.waitForURL((url) =>
    url.pathname === '/' || url.pathname === '/vitals' || url.pathname === '/summary'
  );
  // Optionally, check for a unique dashboard element if you have one, e.g.:
  // await expect(page.getByText('Total Users:')).toBeVisible();
  // For now, just check the URL is correct
  const currentPath = new URL(page.url()).pathname;
  expect(['/', '/vitals', '/summary']).toContain(currentPath);
});

test('Unsuccessful login stays on login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill(UNREGISTERED_EMAIL);
  await page.getByLabel('Password').fill(INVALID_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  // Should remain on login page
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});

test('Sign up button navigates to registration page', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/register/);
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
}); 