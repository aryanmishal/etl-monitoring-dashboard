// pages/LoginPage.js
import { expect } from '@playwright/test';

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /login/i });
    this.emailInput = page.getByLabel(/email id/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByTestId('user-login-btn');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.errorMessage = page.locator('.text-red-800');
    this.rememberMeCheckbox = page.getByLabel(/remember me/i);
    this.adminLoginButton = page.getByRole('button', { name: /admin login/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.loginButton.click();
  }

  async assertOnLoginPage() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }
} 