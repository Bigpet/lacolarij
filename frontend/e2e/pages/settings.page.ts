import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  readonly heading: Locator;
  readonly addConnectionButton: Locator;
  readonly connectionItems: Locator;
  readonly errorMessage: Locator;
  readonly loadingText: Locator;
  readonly emptyText: Locator;

  // Form fields
  readonly nameInput: Locator;
  readonly jiraUrlInput: Locator;
  readonly emailInput: Locator;
  readonly apiTokenInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Settings")');
    this.addConnectionButton = page.locator('button:has-text("Add Connection")');
    this.connectionItems = page.locator('.border.rounded-md');
    this.errorMessage = page.locator('.text-destructive, [role="alert"]');
    this.loadingText = page.locator('text=Loading...');
    this.emptyText = page.locator('text=No connections configured yet.');

    // Form fields
    this.nameInput = page.locator('#name');
    this.jiraUrlInput = page.locator('#jiraUrl');
    this.emailInput = page.locator('#email');
    this.apiTokenInput = page.locator('#apiToken');
    this.saveButton = page.locator('button:has-text("Save Connection")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async openAddConnectionForm() {
    await this.addConnectionButton.click();
    await expect(this.nameInput).toBeVisible();
  }

  async fillConnectionForm(data: {
    name: string;
    jiraUrl: string;
    email: string;
    apiToken: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.jiraUrlInput.fill(data.jiraUrl);
    await this.emailInput.fill(data.email);
    await this.apiTokenInput.fill(data.apiToken);
  }

  async submitConnectionForm() {
    await this.saveButton.click();
  }

  async addConnection(data: {
    name: string;
    jiraUrl: string;
    email: string;
    apiToken: string;
  }) {
    await this.openAddConnectionForm();
    await this.fillConnectionForm(data);
    await this.submitConnectionForm();
    // Wait for form to close (button reappears)
    await expect(this.addConnectionButton).toBeVisible({ timeout: 5000 });
  }

  async cancelForm() {
    await this.cancelButton.click();
    await expect(this.addConnectionButton).toBeVisible();
  }

  async getConnectionCount(): Promise<number> {
    return await this.connectionItems.count();
  }

  getConnectionItem(name: string): Locator {
    return this.page.locator(`.border.rounded-md:has-text("${name}")`);
  }

  async deleteConnection(name: string) {
    const item = this.getConnectionItem(name);
    await item.locator('button').click();
  }

  async expectConnectionExists(name: string) {
    await expect(this.getConnectionItem(name)).toBeVisible();
  }

  async expectConnectionNotExists(name: string) {
    await expect(this.getConnectionItem(name)).not.toBeVisible();
  }

  async waitForLoaded() {
    await expect(this.loadingText).not.toBeVisible({ timeout: 10000 });
  }
}
