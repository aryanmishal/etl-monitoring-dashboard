// sample.spec.js
import { test, expect } from '@playwright/test';

test('login page renders correctly', async ({ page }) => {
  await page.goto('/login');

  // Check for the heading
  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

  // Check for the email input
  await expect(page.getByLabel(/email id/i)).toBeVisible();

  // Check for the password input
  await expect(page.getByLabel(/password/i)).toBeVisible();

  // Check for the login button using test id
  await expect(page.getByTestId('user-login-btn')).toBeVisible();

  // Check for the "Forgot password?" link
  await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
}); 