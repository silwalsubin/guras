# UserService Tests

This test project contains comprehensive tests for the UserService, covering both unit tests and integration tests.

## Test Structure

### Unit Tests (`UserServiceTests.cs`)
- **Mock-based tests** that isolate the service layer
- **Fast execution** with no external dependencies
- **Comprehensive coverage** of business logic
- **Edge case testing** for validation and error scenarios

### Integration Tests (`UserServiceIntegrationTests.cs`)
- **End-to-end database workflow** testing
- **Real database operations** using actual connection factory
- **Data persistence verification** 
- **CRUD operation validation**

## Test Coverage

### Business Logic Tests
- ✅ User creation with validation
- ✅ User update with existence checks
- ✅ User deletion with cleanup
- ✅ Duplicate email prevention
- ✅ Required field validation
- ✅ Timestamp management

### Database Integration Tests
- ✅ Create user in database
- ✅ Read user from database
- ✅ Update user in database
- ✅ Delete user from database
- ✅ Search by email
- ✅ Search by Firebase UID
- ✅ Existence checks

## Running Tests

### Prerequisites
- .NET 8.0 SDK
- SQL Server (local or test instance)
- Test database configured

### Run All Tests
```bash
cd server/tests
dotnet test
```

### Run Specific Test Categories
```bash
# Run only unit tests
dotnet test --filter "Category=Unit"

# Run only integration tests  
dotnet test --filter "Category=Integration"

# Run specific test method
dotnet test --filter "FullyQualifiedName~CreateUser_ShouldCreateUserInDatabase_WhenValidPayloadProvided"
```

### Run Tests with Coverage
```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Test Configuration

The tests use the `TestConfiguration` class to:
- Set up dependency injection
- Configure test database connections
- Provide logging services
- Manage test service lifecycle

## Database Setup

For integration tests to work:
1. Ensure SQL Server is running
2. Create a test database (e.g., `guras_test`)
3. Run database migrations on test database
4. Update connection string in `TestConfiguration.cs` if needed

## Test Data Management

- Tests use **unique email addresses** with GUIDs to avoid conflicts
- **Automatic cleanup** after each test
- **Isolated test data** to prevent test interference
- **Proper disposal** of database connections

## Best Practices

- **Arrange-Act-Assert** pattern for clear test structure
- **Descriptive test names** that explain the scenario
- **Comprehensive assertions** using FluentAssertions
- **Proper mocking** to isolate units under test
- **Integration testing** for end-to-end workflows
- **Cleanup and disposal** to maintain test isolation

## Troubleshooting

### Common Issues
1. **Database connection failures** - Check SQL Server and connection string
2. **Test data conflicts** - Ensure unique identifiers in test data
3. **Mock setup errors** - Verify mock configurations match actual method signatures

### Debug Mode
```bash
dotnet test --logger "console;verbosity=detailed"
```

## Adding New Tests

When adding new tests:
1. Follow the existing naming convention
2. Use the established test structure
3. Include proper cleanup in integration tests
4. Add appropriate assertions and verifications
5. Document any new test scenarios
