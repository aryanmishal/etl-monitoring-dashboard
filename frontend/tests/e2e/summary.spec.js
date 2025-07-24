import { test, expect } from '@playwright/test';

test.describe('Summary Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email id/i).fill('test@gmail.com');
    await page.getByLabel(/password/i).fill('testpassword');
    await page.getByTestId('user-login-btn').click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('shows summary card', async ({ page }) => {
    await page.goto('/');
    // Wait for loading to finish
    await expect(page.getByRole('heading', { name: /summary report/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/key metrics/i)).toBeVisible();
    await expect(page.getByText(/ingestion status/i)).toBeVisible();
    await expect(page.getByText(/pipeline status/i)).toBeVisible();
  });

  test('switches view type', async ({ page }) => {
    await page.goto('/');
    // Switch to weekly
    await page.getByText('Weekly', { exact: true }).click();
    await expect(page.getByRole('heading', { name: /summary report/i })).toBeVisible({ timeout: 10000 });
    // Switch to monthly
    await page.getByText('Monthly', { exact: true }).click();
    await expect(page.getByRole('heading', { name: /summary report/i })).toBeVisible({ timeout: 10000 });
    // Switch back to daily
    await page.getByText('Daily', { exact: true }).click();
    await expect(page.getByRole('heading', { name: /summary report/i })).toBeVisible({ timeout: 10000 });
  });

  // Removed the test for failed summary data load as requested
}); 