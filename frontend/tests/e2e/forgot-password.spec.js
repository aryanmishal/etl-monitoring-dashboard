import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';

test('forgot password page loads and validates UI', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.forgotPasswordLink.click();
  const forgot = new ForgotPasswordPage(page);
  await forgot.assertOnForgotPasswordPage();
});

test('navigate from login to forgot password and back', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.forgotPasswordLink.click();
  const forgot = new ForgotPasswordPage(page);
  await forgot.assertOnForgotPasswordPage();
  await forgot.backToLoginLink.click();
  await login.assertOnLoginPage();
});

test('forgot password with invalid email shows error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.forgotPasswordLink.click();
  await page.getByLabel(/email/i).fill('notarealuser@example.com');
  await page.getByRole('button', { name: /next/i }).click();
  // Error message should appear
  await expect(page.locator('.text-red-100, .text-red-800')).toBeVisible();
});

test('forgot password valid flow proceeds to code and new password steps', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.forgotPasswordLink.click();
  await page.getByLabel(/email/i).fill('test@gmail.com');
  await page.getByRole('button', { name: /next/i }).click();
  // Should see code input
  await expect(page.getByLabel(/verification code/i)).toBeVisible();
  await page.getByLabel(/verification code/i).fill('123456');
  await page.getByRole('button', { name: /verify/i }).click();
  // Should see new password fields (use specific label text)
  await expect(page.getByLabel(/enter new password/i)).toBeVisible();
  await expect(page.getByLabel(/confirm new password/i)).toBeVisible();
}); 