// pages/AdminLoginPage.js
import { expect } from '@playwright/test';

export class AdminLoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /admin access/i });
    this.accessCodeInput = page.getByPlaceholder(/access code/i);
    this.enterButton = page.getByRole('button', { name: /enter/i });
    this.backToLoginButton = page.getByRole('button', { name: /back to login/i });
  }

  async goto() {
    await this.page.goto('/admin-login');
  }

  async assertOnAdminLoginPage() {
    await expect(this.heading).toBeVisible();
    await expect(this.accessCodeInput).toBeVisible();
    await expect(this.enterButton).toBeVisible();
    await expect(this.backToLoginButton).toBeVisible();
  }
} 