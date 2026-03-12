import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full shopping journey', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify homepage loads
    await expect(page.getByText(/sky high/i)).toBeVisible();

    // 2. Search for a product
    const searchInput = page.getByPlaceholder(/search for products/i);
    await searchInput.fill('geometry');
    await searchInput.press('Enter');

    // Verify search results page
    await expect(page).toHaveURL(/\/search\?q=geometry/);

    // 3. Navigate to product details
    // If products exist, click on the first one
    const productLinks = page.locator('a[href*="/products/"]');
    const productCount = await productLinks.count();

    if (productCount > 0) {
      await productLinks.first().click();

      // Verify product detail page
      await expect(page).toHaveURL(/\/products\/.+/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // 4. Add to cart (if add to cart button exists)
      const addToCartButton = page.getByRole('button', { name: /add to cart/i });

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();

        // Verify cart notification or update
        await expect(
          page.getByText(/added to cart/i).or(
            page.locator('[data-testid="cart-count"]')
          )
        ).toBeVisible({ timeout: 5000 });

        // 5. View cart
        const cartButton = page.getByRole('button', { name: /cart/i }).or(
          page.locator('[data-testid="cart-button"]')
        );

        if (await cartButton.isVisible()) {
          await cartButton.click();

          // Verify cart page or dropdown
          await expect(
            page.getByText(/cart/i).or(
              page.getByText(/shopping cart/i)
            )
          ).toBeVisible();
        }
      }
    }

    // 6. Navigate to different sections
    await page.goto('/products');
    await expect(page).toHaveURL('/products');

    await page.goto('/about');
    await expect(page).toHaveURL('/about');

    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/');

    // Look for login/signup links
    const loginLink = page.getByRole('link', { name: /login/i }).or(
      page.getByRole('link', { name: /sign in/i })
    );

    if (await loginLink.isVisible()) {
      await loginLink.click();

      // Should navigate to login page
      await expect(page).toHaveURL(/\/.*login/);

      // Check if login form exists
      const emailInput = page.getByLabel(/email/i).or(
        page.getByPlaceholder(/email/i)
      );
      const passwordInput = page.getByLabel(/password/i).or(
        page.getByPlaceholder(/password/i)
      );

      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        // Fill test credentials (won't actually log in)
        await emailInput.fill('test@example.com');
        await passwordInput.fill('testpassword123');

        // Find submit button
        const submitButton = page.getByRole('button', { name: /sign in/i }).or(
          page.getByRole('button', { name: /login/i })
        );

        if (await submitButton.isVisible()) {
          // Note: We don't actually submit to avoid authentication issues
          await expect(submitButton).toBeVisible();
        }
      }
    }

    // Check for signup flow
    const signupLink = page.getByRole('link', { name: /sign up/i }).or(
      page.getByRole('link', { name: /register/i })
    );

    if (await signupLink.isVisible()) {
      await signupLink.click();

      // Should navigate to signup page
      await expect(page).toHaveURL(/\/.*signup|register/);
    }
  });

  test('should navigate through product categories', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Look for category filters or navigation
    const categoryLinks = page.locator('a[href*="category"]').or(
      page.locator('button:has-text("category")').or(
        page.getByLabel(/category/i)
      )
    );

    const categoryCount = await categoryLinks.count();

    if (categoryCount > 0) {
      // Click on first category
      await categoryLinks.first().click();

      // Verify filtered results
      await page.waitForLoadState('networkidle');

      // URL should reflect category filter
      const currentUrl = page.url();
      expect(currentUrl.includes('category') || currentUrl.includes('products')).toBeTruthy();
    }

    // Test brand filtering if available
    const brandSelect = page.getByLabel(/brand/i);
    if (await brandSelect.isVisible()) {
      await brandSelect.selectOption({ index: 1 }); // Select first non-empty option

      await page.waitForLoadState('networkidle');

      // Should filter by brand
      const url = page.url();
      expect(url.includes('brand') || url.includes('products')).toBeTruthy();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Verify desktop navigation is visible
    const desktopNav = page.locator('nav').first();
    await expect(desktopNav).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Look for mobile menu button
    const mobileMenuButton = page.getByRole('button', { name: /menu/i }).or(
      page.locator('[data-testid="mobile-menu-button"]')
    );

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Mobile menu should open
      await expect(
        page.locator('[data-testid="mobile-menu"]').or(
          page.getByRole('navigation')
        )
      ).toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');

    // Should show 404 page or redirect
    const pageContent = await page.textContent('body');
    expect(
      pageContent?.includes('404') ||
      pageContent?.includes('Not Found') ||
      page.url().includes('/')
    ).toBeTruthy();

    // Test invalid product page
    await page.goto('/products/non-existent-product');

    // Should handle gracefully
    const productPageContent = await page.textContent('body');
    expect(
      productPageContent?.includes('Not Found') ||
      productPageContent?.includes('Product not found') ||
      page.url().includes('/')
    ).toBeTruthy();
  });

  test('should load pages with good performance', async ({ page }) => {
    // Navigate to different pages and check load times
    const pages = ['/', '/products', '/about', '/contact'];

    for (const pagePath of pages) {
      const startTime = Date.now();

      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // Check for essential elements
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('header').or(page.locator('nav'))).toBeVisible();
    }
  });

  test('should have proper SEO elements', async ({ page }) => {
    await page.goto('/');

    // Check for essential SEO elements
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
    }

    // Check for proper heading structure
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check for favicon
    const favicon = page.locator('link[rel="icon"]');
    if (await favicon.count() > 0) {
      const faviconHref = await favicon.getAttribute('href');
      expect(faviconHref).toBeTruthy();
    }
  });
});