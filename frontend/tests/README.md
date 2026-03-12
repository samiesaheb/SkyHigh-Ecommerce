# Sky High Testing Suite

This directory contains comprehensive tests for the Sky High e-commerce frontend application.

## Test Structure

### 📁 `/unit`
Unit tests that test individual functions and modules in isolation.
- `search.test.ts` - Tests for search engine functionality
- `utils.test.ts` - Tests for utility functions

### 📁 `/integration`
Integration tests that test how components work together.
- `SearchBar.test.tsx` - Tests for search bar component integration
- `cart.test.tsx` - Tests for cart functionality

### 📁 `/e2e`
End-to-end tests using Playwright that test complete user workflows.
- `search.spec.ts` - Complete search functionality testing
- `user-journey.spec.ts` - Full user journey testing

### 📁 `/utils`
Test utilities and helper functions.
- `test-utils.tsx` - Custom render functions and test helpers

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests with UI
```bash
npm run test:e2e:ui
```

## Test Features

### ✅ Unit Tests
- Search engine functionality
- Utility functions (image URLs, price formatting, etc.)
- URL parameter parsing
- Search result highlighting
- Filter management

### ✅ Integration Tests
- Search bar autocomplete
- Keyboard navigation
- Cart state management
- Component interactions
- API mocking with MSW

### ✅ E2E Tests
- Complete search workflows
- Product navigation
- Cart functionality
- Authentication flows
- Mobile responsiveness
- Error handling
- Performance testing
- SEO validation

## Test Configuration

### Jest Configuration
- Located in `jest.config.js`
- Uses Next.js Jest configuration
- Custom test environment setup in `jest.setup.js`

### Playwright Configuration
- Located in `playwright.config.ts`
- Tests across multiple browsers (Chromium, Firefox, Safari)
- Mobile device testing
- Automatic server startup

## Mocking

### API Mocking
- Uses Jest mocks for unit tests
- MSW (Mock Service Worker) for integration tests
- Custom fetch mocks with realistic responses

### Component Mocking
- Mock complex dependencies
- Focus on testing component logic
- Isolated component behavior

## Best Practices

### Test Organization
- Clear test descriptions
- Grouped related tests
- Setup and teardown in beforeEach/afterEach

### Assertions
- Specific and meaningful assertions
- Test both positive and negative cases
- Error handling validation

### Maintainability
- Use test utilities for common operations
- Mock external dependencies
- Keep tests focused and readable

## Debugging Tests

### Jest Debugging
```bash
npm run test:watch -- --verbose
```

### Playwright Debugging
```bash
npm run test:e2e:headed
```

## CI/CD Integration

These tests are designed to run in continuous integration environments:
- All tests should pass before deployment
- Coverage reports for code quality metrics
- E2E tests validate production readiness

## Coverage Goals

- Unit tests: 80%+ coverage for business logic
- Integration tests: Critical user flows
- E2E tests: Complete user journeys

## Adding New Tests

1. **Unit Tests**: Add to appropriate file in `/unit` directory
2. **Integration Tests**: Create new file in `/integration` for component testing
3. **E2E Tests**: Add new scenarios to existing spec files or create new ones

## Test Data

- Use factory functions for consistent test data
- Mock realistic API responses
- Include edge cases and error scenarios