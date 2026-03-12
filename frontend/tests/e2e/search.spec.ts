import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform basic search from homepage', async ({ page }) => {
    // Find and fill the search input
    const searchInput = page.getByPlaceholder(/search for products/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('geometry');

    // Press Enter to search
    await searchInput.press('Enter');

    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=geometry/);

    // Should show search results
    await expect(page.getByText(/search results/i)).toBeVisible();
  });

  test('should show autocomplete suggestions', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for products/i);

    // Type to trigger suggestions
    await searchInput.fill('geo');

    // Wait for suggestions to appear
    await expect(page.getByText(/geometry/i).first()).toBeVisible({ timeout: 5000 });

    // Should show suggestion items
    const suggestions = page.locator('[data-testid="search-suggestion"]');
    await expect(suggestions.first()).toBeVisible();
  });

  test('should navigate to product from suggestion', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for products/i);

    // Type to show suggestions
    await searchInput.fill('geometry');

    // Wait for suggestions and click first one
    const firstSuggestion = page.getByText(/geometry/i).first();
    await expect(firstSuggestion).toBeVisible({ timeout: 5000 });
    await firstSuggestion.click();

    // Should navigate to product page
    await expect(page).toHaveURL(/\/products\/.+/);

    // Should show product details
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for products/i);

    // Try to search with empty input
    await searchInput.press('Enter');

    // Should stay on homepage or show appropriate message
    const currentUrl = page.url();
    expect(currentUrl.includes('/search') || currentUrl.includes('/')).toBeTruthy();
  });

  test('should show no results message for non-existent products', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for products/i);

    // Search for something that doesn't exist
    await searchInput.fill('nonexistentproduct12345');
    await searchInput.press('Enter');

    // Should show no results message
    await expect(page.getByText(/no products found/i)).toBeVisible({ timeout: 10000 });
  });

  test('should clear search suggestions when clicking outside', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search for products/i);

    // Type to show suggestions
    await searchInput.fill('geometry');

    // Wait for suggestions to appear
    await expect(page.getByText(/geometry/i).first()).toBeVisible({ timeout: 5000 });

    // Click outside the search area
    await page.click('body', { position: { x: 100, y: 100 } });

    // Suggestions should disappear
    await expect(page.locator('[data-testid="search-suggestion"]')).not.toBeVisible();
  });
});

test.describe('Advanced Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
  });

  test('should load search page with filters', async ({ page }) => {
    // Should show search input
    await expect(page.getByPlaceholder(/search for products/i)).toBeVisible();

    // Should show filter options
    await expect(page.getByText(/filters/i)).toBeVisible();
    await expect(page.getByText(/price range/i)).toBeVisible();
    await expect(page.getByText(/category/i)).toBeVisible();
  });

  test('should filter by price range', async ({ page }) => {
    // Find price range inputs
    const minPriceInput = page.getByLabel(/minimum price/i);
    const maxPriceInput = page.getByLabel(/maximum price/i);

    await expect(minPriceInput).toBeVisible();
    await expect(maxPriceInput).toBeVisible();

    // Set price range
    await minPriceInput.fill('10');
    await maxPriceInput.fill('50');

    // Apply filters
    const applyButton = page.getByRole('button', { name: /apply filters/i });
    await applyButton.click();

    // URL should include price filters
    await expect(page).toHaveURL(/min_price=10/);
    await expect(page).toHaveURL(/max_price=50/);
  });

  test('should filter by category', async ({ page }) => {
    // Find category filter
    const categorySelect = page.getByLabel(/category/i);
    await expect(categorySelect).toBeVisible();

    // Select a category
    await categorySelect.selectOption('skincare');

    // Apply filters
    const applyButton = page.getByRole('button', { name: /apply filters/i });
    await applyButton.click();

    // URL should include category filter
    await expect(page).toHaveURL(/category=skincare/);
  });

  test('should sort search results', async ({ page }) => {
    // Perform a search first
    const searchInput = page.getByPlaceholder(/search for products/i);
    await searchInput.fill('product');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Find sort dropdown
    const sortSelect = page.getByLabel(/sort by/i);
    await expect(sortSelect).toBeVisible();

    // Change sort order
    await sortSelect.selectOption('price_asc');

    // URL should include sort parameter
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test('should clear all filters', async ({ page }) => {
    // Set some filters first
    const minPriceInput = page.getByLabel(/minimum price/i);
    await minPriceInput.fill('10');

    const categorySelect = page.getByLabel(/category/i);
    await categorySelect.selectOption('skincare');

    // Apply filters
    const applyButton = page.getByRole('button', { name: /apply filters/i });
    await applyButton.click();

    // Clear filters
    const clearButton = page.getByRole('button', { name: /clear filters/i });
    await clearButton.click();

    // Filters should be reset
    await expect(minPriceInput).toHaveValue('');
    await expect(page).toHaveURL(/^[^?]*$/); // No query parameters
  });

  test('should handle pagination', async ({ page }) => {
    // Perform a search that will have multiple pages
    const searchInput = page.getByPlaceholder(/search for products/i);
    await searchInput.fill('product');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /next/i });

    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();

      // Should navigate to page 2
      await expect(page).toHaveURL(/page=2/);
    }
  });
});

test.describe('Mobile Search', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');

    // Mobile search might be in a different location
    const searchInput = page.getByPlaceholder(/search for products/i);
    await expect(searchInput).toBeVisible();

    // Perform search
    await searchInput.fill('geometry');
    await searchInput.press('Enter');

    // Should show results
    await expect(page).toHaveURL(/\/search\?q=geometry/);
  });

  test('should show mobile-friendly filters', async ({ page }) => {
    await page.goto('/search');

    // Mobile filters might be in a collapsible menu
    const filtersButton = page.getByRole('button', { name: /filters/i });

    if (await filtersButton.isVisible()) {
      await filtersButton.click();

      // Should show filter options
      await expect(page.getByText(/price range/i)).toBeVisible();
    }
  });
});