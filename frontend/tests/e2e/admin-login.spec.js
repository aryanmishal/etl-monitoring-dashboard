import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';

test('admin login page loads and validates UI', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.adminLoginButton.click();
  const admin = new AdminLoginPage(page);
  await admin.assertOnAdminLoginPage();
}); 