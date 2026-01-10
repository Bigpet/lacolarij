import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BoardPage extends BasePage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly columnsContainer: Locator;
  readonly columns: Locator;
  readonly cards: Locator;
  readonly quickFilters: Locator;
  readonly columnSettingsButton: Locator;
  readonly columnSettingsPanel: Locator;
  readonly emptyState: Locator;
  readonly clearFiltersButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('[data-testid="board-heading"]');
    this.searchInput = page.locator('[data-testid="board-search"]');
    this.columnsContainer = page.locator('[data-testid="board-columns"]');
    this.columns = page.locator('[data-testid="board-column"]');
    this.cards = page.locator('[data-testid="board-card"]');
    this.quickFilters = page.locator('[data-testid="quick-filters"]');
    this.columnSettingsButton = page.locator('button:has-text("Columns")');
    this.columnSettingsPanel = page.locator('[data-testid="column-settings-panel"]');
    this.emptyState = page.locator('[data-testid="board-empty-state"]');
    this.clearFiltersButton = page.locator('[data-testid="clear-filters"]');
  }

  /**
   * Wait for the board page to finish loading
   */
  async waitForLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
    await expect(this.columnsContainer).toBeVisible({ timeout: 10000 });
  }

  /**
   * Search for issues on the board
   * @param query - The search query
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(400);
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  // =====================
  // Column Methods
  // =====================

  /**
   * Get a column by its status category (e.g., "todo", "indeterminate", "done")
   */
  getColumn(statusCategory: string): Locator {
    return this.page.locator(`[data-testid="board-column"][data-status-category="${statusCategory}"]`);
  }

  /**
   * Get a column by its ID (e.g., "todo", "in-progress", "done")
   */
  getColumnById(columnId: string): Locator {
    return this.page.locator(`[data-testid="board-column"][data-column-id="${columnId}"]`);
  }

  /**
   * Get the count of visible columns
   */
  async getColumnCount(): Promise<number> {
    return await this.columns.count();
  }

  /**
   * Get the issue count badge for a specific column
   */
  async getColumnIssueCount(statusCategory: string): Promise<number> {
    const column = this.getColumn(statusCategory);
    const countBadge = column.locator('[data-testid="column-count"]');
    const text = await countBadge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
   * Get all column titles in order
   */
  async getColumnTitles(): Promise<string[]> {
    const titles = await this.columns.locator('h3').allTextContents();
    return titles;
  }

  // =====================
  // Card Methods
  // =====================

  /**
   * Get all cards in a specific column
   */
  getCardsInColumn(statusCategory: string): Locator {
    const column = this.getColumn(statusCategory);
    return column.locator('[data-testid="board-card"]');
  }

  /**
   * Get a card by its issue key
   */
  getCard(issueKey: string): Locator {
    return this.page.locator(`[data-testid="board-card"][data-issue-key="${issueKey}"]`);
  }

  /**
   * Get the total count of cards on the board
   */
  async getTotalCardCount(): Promise<number> {
    return await this.cards.count();
  }

  /**
   * Get all issue keys visible on the board
   */
  async getAllIssueKeys(): Promise<string[]> {
    const keys = await this.cards.evaluateAll(cards =>
      cards.map(card => card.getAttribute('data-issue-key') || '')
    );
    return keys.filter(key => key !== '');
  }

  /**
   * Get the sync status of a card
   */
  async getCardSyncStatus(issueKey: string): Promise<string | null> {
    const card = this.getCard(issueKey);
    return await card.getAttribute('data-sync-status');
  }

  /**
   * Click on a card to navigate to its detail page
   */
  async clickCard(issueKey: string) {
    const card = this.getCard(issueKey);
    await card.click();
    await this.page.waitForURL(/\/issues\//);
  }

  /**
   * Check if a card exists on the board
   */
  async hasCard(issueKey: string): Promise<boolean> {
    const card = this.getCard(issueKey);
    return await card.isVisible();
  }

  /**
   * Check which column a card is in
   */
  async getCardColumn(issueKey: string): Promise<string | null> {
    const card = this.getCard(issueKey);
    const column = card.locator('xpath=ancestor::*[@data-testid="board-column"]');
    return await column.getAttribute('data-status-category');
  }

  // =====================
  // Drag and Drop Methods
  // =====================

  /**
   * Drag a card to a different column
   * @param issueKey - The issue key of the card to drag
   * @param targetStatusCategory - The target status category (e.g., "todo", "indeterminate", "done")
   * @param waitForSync - Whether to wait for sync to complete after dragging (default: true)
   */
  async dragCardToColumn(issueKey: string, targetStatusCategory: string, waitForSync = true) {
    const card = this.getCard(issueKey);
    const targetColumn = this.getColumn(targetStatusCategory);

    // Ensure the card is visible before dragging
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible({ timeout: 5000 });

    // Use Playwright's drag and drop
    await card.dragTo(targetColumn);

    // Wait for the transition animation to complete
    await this.page.waitForTimeout(300);

    // Wait for sync to complete if requested
    if (waitForSync) {
      await this.waitForSyncIdleWithUiUpdate();
    }
  }

  /**
   * Drag a card to a specific position in a column
   */
  async dragCardToPosition(issueKey: string, targetStatusCategory: string, position: number) {
    const card = this.getCard(issueKey);
    const targetColumn = this.getColumn(targetStatusCategory);
    const targetCards = targetColumn.locator('[data-testid="board-card"]');

    if (position === 0) {
      // Drop at the top of the column
      await card.dragTo(targetColumn, { targetPosition: { x: 150, y: 50 } });
    } else {
      const targetCard = targetCards.nth(position - 1);
      await card.dragTo(targetCard);
    }

    await this.page.waitForTimeout(500);
  }

  // =====================
  // Quick Filter Methods
  // =====================

  /**
   * Toggle a quick filter by its ID
   */
  async toggleQuickFilter(filterId: string) {
    const filter = this.page.locator(`[data-testid="quick-filter-${filterId}"]`);
    await filter.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if a quick filter is active
   */
  async isQuickFilterActive(filterId: string): Promise<boolean> {
    const filter = this.page.locator(`[data-testid="quick-filter-${filterId}"]`);
    const isActive = await filter.getAttribute('data-active');
    return isActive === 'true';
  }

  /**
   * Clear all quick filters
   */
  async clearQuickFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Get all active filter IDs
   */
  async getActiveFilters(): Promise<string[]> {
    const activeFilters = await this.quickFilters.locator('button[data-active="true"]').evaluateAll(
      buttons => buttons.map(btn => {
        const testId = btn.getAttribute('data-testid') || '';
        return testId.replace('quick-filter-', '');
      })
    );
    return activeFilters;
  }

  // =====================
  // Column Settings Methods
  // =====================

  /**
   * Open the column settings panel
   */
  async openColumnSettings() {
    await this.columnSettingsButton.click();
    await expect(this.columnSettingsPanel).toBeVisible();
  }

  /**
   * Close the column settings panel
   */
  async closeColumnSettings() {
    if (await this.columnSettingsPanel.isVisible()) {
      await this.columnSettingsButton.click();
      await expect(this.columnSettingsPanel).not.toBeVisible();
    }
  }

  /**
   * Toggle column visibility in settings
   */
  async toggleColumnVisibility(columnTitle: string) {
    if (!await this.columnSettingsPanel.isVisible()) {
      await this.openColumnSettings();
    }
    const button = this.columnSettingsPanel.locator(`button:has-text("${columnTitle}")`);
    await button.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Reset column settings to default
   */
  async resetColumnSettings() {
    if (!await this.columnSettingsPanel.isVisible()) {
      await this.openColumnSettings();
    }
    const resetButton = this.columnSettingsPanel.locator('button:has-text("Reset")');
    await resetButton.click();
    await this.page.waitForTimeout(300);
  }

  // =====================
  // Empty State Methods
  // =====================

  /**
   * Check if the empty state is displayed
   */
  async hasEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }
}
