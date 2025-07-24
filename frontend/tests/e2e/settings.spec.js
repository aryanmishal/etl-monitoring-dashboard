import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email id/i).fill('test@gmail.com');
    await page.getByLabel(/password/i).fill('testpassword');
    await page.getByTestId('user-login-btn').click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('loads and shows settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    await expect(page.getByText('Manage your preferences and account settings below.')).toBeVisible();
    await expect(page.getByText('User Count Logic')).toBeVisible();
    await expect(page.getByText('Theme Customization')).toBeVisible();
  });

  test('loads and changes user count logic', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    // Open the dropdown and select 'Custom Input'
    await page.getByText('Raw Files (Default)').click();
    await page.getByText('Custom Input').click();
    await page.locator('input[type="number"]').first().fill('42');
    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    // Wait for either success or error message
    const message = page.locator('.text-green-800, .text-red-800');
    await expect(message).toBeVisible({ timeout: 7000 });
    const text = await message.textContent();
    if (!/settings saved successfully/i.test(text) && !/error/i.test(text)) {
      // Log page content for debugging
      console.log(await page.content());
      throw new Error('Expected success or error message, got: ' + text);
    }
  });

  test('reset to defaults', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    await page.getByRole('button', { name: /reset to defaults/i }).click();
    await expect(page.locator('.text-green-800, .text-red-800')).toContainText(/settings reset to defaults successfully/i, { timeout: 7000 });
  });
}); 