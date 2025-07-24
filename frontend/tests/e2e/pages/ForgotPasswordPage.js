// pages/ForgotPasswordPage.js
import { expect } from '@playwright/test';

export class ForgotPasswordPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /forgot password/i });
    this.emailInput = page.getByLabel(/email/i);
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.backToLoginLink = page.getByRole('link', { name: /back to login/i });
  }

  async goto() {
    await this.page.goto('/forgot-password');
  }

  async assertOnForgotPasswordPage() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.nextButton).toBeVisible();
    await expect(this.backToLoginLink).toBeVisible();
  }
} 