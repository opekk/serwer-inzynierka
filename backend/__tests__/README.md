# AuctionHub Backend Test Suite

This directory contains 24 comprehensive tests for the AuctionHub backend application.

## Test Structure

```
__tests__/
├── unit/                           # Unit tests (11 tests)
│   ├── user.model.test.js         # User model tests (7 tests)
│   └── auction.model.test.js      # Auction model tests (4 tests)
│
├── implementation/                 # Implementation tests (6 tests)
│   └── auth.controller.test.js    # Authentication controller tests
│
├── functional/                     # Functional tests (7 tests)
│   └── auction-flow.test.js       # End-to-end auction flows
│
├── setup.js                        # Global test setup
└── README.md                       # This file
```

## Test Summary

**Total: 24 tests** across 4 categories

### 1. Unit Tests - User Model (7 tests)
- User creation and validation (3 tests)
- Password hashing (2 tests)
- User methods (2 tests)

### 2. Unit Tests - Auction Model (4 tests)
- Auction creation and validation (2 tests)
- Auction methods (2 tests)

### 3. Implementation Tests - Authentication (6 tests)
- User registration (3 tests)
- User login (3 tests)

### 4. Functional Tests - Auction Flow (7 tests)
- Complete auction creation flow
- Bidding flow
- Auction completion with winner
- Watchlist functionality
- Category filtering
- User statistics tracking
- Wallet management

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# Run only unit tests
npm test -- __tests__/unit

# Run only implementation tests
npm test -- __tests__/implementation

# Run only functional tests
npm test -- __tests__/functional
```

### Run Specific Test Files
```bash
# Run user model tests
npm test -- __tests__/unit/user.model.test.js

# Run auction model tests
npm test -- __tests__/unit/auction.model.test.js

# Run auth controller tests
npm test -- __tests__/implementation/auth.controller.test.js

# Run functional tests
npm test -- __tests__/functional/auction-flow.test.js
```

## Test Categories Explained

### Unit Tests
Test individual components in isolation (models, utilities, methods).

**Coverage:**
- User model validation, password hashing, instance methods
- Auction model validation, virtual fields, instance methods

### Implementation Tests
Test how features are implemented in controllers with HTTP requests.

**Coverage:**
- User registration with validation
- User login with email/username
- Error handling

### Functional Tests
Test complete user flows end-to-end across multiple components.

**Coverage:**
- Auction creation from user registration to listing
- Complete bidding process with multiple bidders
- Auction completion and winner determination
- Watchlist add/remove functionality
- Category and price filtering
- User bidding statistics

## Test Environment

Tests use:
- **MongoDB Memory Server**: In-memory MongoDB instance (no real database needed)
- **Jest**: Testing framework
- **Supertest**: HTTP endpoint testing
- **Isolated Environment**: Each test has a clean database state

## Environment Variables

The following environment variables are automatically set in `setup.js`:
- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key-for-testing-only`
- `JWT_EXPIRES_IN=7d`
- `JWT_COOKIE_EXPIRES_IN=7`

## Coverage Reports

After running `npm run test:coverage`, you'll find coverage reports in:
- **Terminal**: Summary of coverage
- **coverage/** directory: Detailed HTML reports

Target coverage areas:
- **Models**: User, Auction, Bid
- **Controllers**: UserController, AuctionController, BidController, AdminController

## Test Results

All tests passing: ✅ **24/24 tests pass**

```
Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        ~10s
```

## Best Practices

1. **Isolation**: Each test is independent
2. **Clean State**: `afterEach` cleans database between tests
3. **Descriptive Names**: Clear, descriptive test names
4. **AAA Pattern**: Arrange, Act, Assert
5. **Edge Cases**: Tests cover both happy paths and error cases

## Adding New Tests

When adding new features, follow these guidelines:

1. **Unit tests** for new models or utilities
2. **Implementation tests** for new controllers/routes
3. **Functional tests** for new user flows
4. Keep total tests under 30 for maintainability
5. Ensure all tests pass before committing

### Test File Naming Convention
- Unit tests: `*.model.test.js` or `*.util.test.js`
- Implementation tests: `*.controller.test.js`
- Functional tests: `*.flow.test.js`

## Troubleshooting

### Tests Failing Due to Timeout
The default timeout is 30 seconds. If tests timeout, check for:
- Unclosed database connections
- Infinite loops
- Missing async/await

### MongoDB Memory Server Issues
If you encounter errors:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They:
- Don't require external dependencies
- Use in-memory database
- Run quickly (~10 seconds for all tests)
- Provide clear error messages
