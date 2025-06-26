// frontend/e2e/sync-status.spec.js
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Sync Status Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/');
    
    // Wait for the table to be present and have data
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(10);
  });

  test('Sync Status page loads and displays table with correct columns', async ({ page }) => {
    // Check if all required columns are visible
    await expect(page.getByText('User ID')).toBeVisible();
    await expect(page.getByText('Bronze Data')).toBeVisible();
    await expect(page.getByText('Silver RRBucket')).toBeVisible();
    await expect(page.getByText('Silver VitalsBaseline')).toBeVisible();
    await expect(page.getByText('Silver VitalSWT')).toBeVisible();
  });

  test('Pagination works correctly', async ({ page }) => {
    // Get initial page data
    const firstPageFirstRow = await page.locator('table tbody tr').first().textContent();
    
    // Click next page
    await page.getByRole('button', { name: '»' }).click();
    
    // Wait for table to update
    await page.waitForTimeout(1000); // Wait for API call
    
    // Get second page data
    const secondPageFirstRow = await page.locator('table tbody tr').first().textContent();
    
    // Verify data changed
    expect(firstPageFirstRow).not.toBe(secondPageFirstRow);
  });

  test('Date filter works correctly', async ({ page }) => {
    // Get initial data
    const initialData = await page.locator('table tbody tr').first().textContent();
    
    // Select a different date
    const dateInput = page.locator('input[type="date"]');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    await dateInput.fill(yesterdayStr);
    await page.waitForTimeout(1000); // Wait for API call
    
    // Get new data
    const newData = await page.locator('table tbody tr').first().textContent();
    
    // Verify data changed or at least the date input value changed
    const currentDateValue = await dateInput.inputValue();
    expect(currentDateValue).toBe(yesterdayStr);
    
    // If data is the same, at least verify the API was called with new date
    const networkRequests = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(r => r.name.includes('/sync-status'))
        .map(r => r.name);
    });
    expect(networkRequests.some(url => url.includes(yesterdayStr))).toBe(true);
  });

  test('Pagination buttons are disabled appropriately', async ({ page }) => {
    // Previous button should be disabled on first page
    const prevButton = page.getByRole('button', { name: '«' });
    await expect(prevButton).toBeDisabled();
    
    // Go to last page
    const nextButton = page.getByRole('button', { name: '»' });
    while (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000); // Wait for API call
    }
    
    // Next button should be disabled on last page
    await expect(nextButton).toBeDisabled();
    
    // Verify table still has data
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Pagination limit is respected', async ({ page }) => {
    // Check initial page size
    const initialRows = await page.locator('table tbody tr').count();
    expect(initialRows).toBeLessThanOrEqual(10); // Default page size
    
    // Go to next page
    await page.getByRole('button', { name: '»' }).click();
    await page.waitForTimeout(1000); // Wait for API call
    
    // Check page size after navigation
    const nextPageRows = await page.locator('table tbody tr').count();
    expect(nextPageRows).toBeLessThanOrEqual(10);
  });

  test('Page navigation maintains data integrity', async ({ page }) => {
    // Get data from first page
    const firstPageData = await page.locator('table tbody tr').allTextContents();
    
    // Navigate to next page
    await page.getByRole('button', { name: '»' }).click();
    await page.waitForTimeout(1000);
    
    // Get data from second page
    const secondPageData = await page.locator('table tbody tr').allTextContents();
    
    // Verify no data overlap between pages
    const hasOverlap = firstPageData.some(row => secondPageData.includes(row));
    expect(hasOverlap).toBe(false);
  });
});