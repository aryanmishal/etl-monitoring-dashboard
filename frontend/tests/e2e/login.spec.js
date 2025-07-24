import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';

// 1. Login Page Loads and Validates Required Fields

test('login page loads and validates required fields', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.assertOnLoginPage();

  // Try to submit with empty fields
  await login.login('', '');
  // Should still be on login page (no navigation)
  await expect(page).toHaveURL(/\/login/);
});

// 2. Login Fails with Invalid Credentials

test('login fails with invalid credentials', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('invalid@example.com', 'wrongpassword');
  // Error message should appear
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText(/invalid|fail/i);
});

// 3. Login Succeeds with Valid Credentials

test('login succeeds with valid credentials', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('test@gmail.com', 'testpassword');
  // Should redirect to summary page ("/")
  await expect(page).toHaveURL((url) => url.pathname === '/');
  // Navbar should be visible
  await expect(page.getByText(/ETL Monitoring/i)).toBeVisible();
});

// 4. Login with Remember Me persists session

test('login with remember me persists session', async ({ page, context }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.emailInput.fill('test@gmail.com');
  await login.passwordInput.fill('testpassword');
  await login.rememberMeCheckbox.check();
  await login.loginButton.click();
  await expect(page).toHaveURL((url) => url.pathname === '/');
  // Simulate reload
  await page.reload();
  // Should still be logged in (Navbar visible)
  await expect(page.getByText(/ETL Monitoring/i)).toBeVisible();
}); 