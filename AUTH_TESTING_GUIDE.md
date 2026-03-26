# 🧪 Auth Testing Guide

## Overview
This guide explains the authentication tests written for the VISIOBOOK web portal, organized by testing level and scope.

---

## 📊 Test Coverage Summary

| Level | File | Tests | Coverage |
|-------|------|-------|----------|
| **Unit - Services** | `tests/unit/services/tokenService.spec.ts` | 8 | TokenService utility functions |
| **Unit - Services** | `tests/unit/services/authApi.spec.ts` | 11 | API calls (login, register, getCurrentUser) |
| **Unit - Store** | `tests/unit/store/auth.spec.ts` | 28 | Store actions, getters, state |
| **Integration** | `tests/integration/auth.spec.ts` | 12 | End-to-end auth flows |
| **Total** | | **62 tests** | Complete auth flow |

---

## 🏗️ Testing Pyramid

```
        ▲
       ╱ ╲
      ╱   ╲         Integration Tests (12)
     ╱─────╲        • Full login flow
    ╱       ╲       • Full register flow
   ╱─────────╲      • Error handling
  ╱           ╲     • Session restoration
 ╱─────────────╲    
╱_______________╲   Unit Tests (47)
                    • API service methods
                    • Store actions & getters
                    • TokenService utilities
```

---

## 1️⃣ **Unit Tests: TokenService** 
**File**: `tests/unit/services/tokenService.spec.ts`

### What It Tests
- ✅ `setToken()` - Storing token in localStorage
- ✅ `getAccessToken()` - Retrieving token
- ✅ `hasToken()` - Checking if token exists
- ✅ `clearTokens()` - Removing token
- ✅ Token lifecycle (set → get → clear)

### Example Test
```typescript
it('should store token in localStorage', () => {
  // Act
  TokenService.setToken(mockToken)
  
  // Assert
  const stored = localStorage.getItem('vb_access_token')
  expect(stored).toBe(mockToken)
})
```

### Key Concept
These test **pure JavaScript functions** in isolation - no mocking needed!

---

## 2️⃣ **Unit Tests: AuthApi Service**
**File**: `tests/unit/services/authApi.spec.ts`

### What It Tests
- ✅ **login()** - Makes POST /auth/login call
- ✅ **register()** - Makes POST /auth/register call
- ✅ **getCurrentUser()** - Makes GET /users/me call
- ✅ **logout()** - Clears token
- ✅ Error handling for API failures

### Example Test
```typescript
it('should send login credentials to API', async () => {
  // Arrange
  const credentials = { email: 'test@example.com', password: 'pass' }
  api.post.mockResolvedValue(mockTokenResponse)

  // Act
  const result = await authApi.login(credentials)

  // Assert
  expect(api.post).toHaveBeenCalledWith('/auth/login', {
    email: 'test@example.com',
    password: 'pass',
  })
})
```

### Key Concept
Tests **API service methods** with mocked HTTP calls using Vitest's `vi.fn()`.

---

## 3️⃣ **Unit Tests: Auth Store**
**File**: `tests/unit/store/auth.spec.ts`

### What It Tests

#### Initial State
- ✅ `user` is null
- ✅ `error` is null
- ✅ `isLoading` is false

#### login() Action
- ✅ Sets `isLoading` to true during login
- ✅ Calls `authApi.login()` with credentials
- ✅ Fetches user profile after login
- ✅ Sets user data in store
- ✅ Clears errors on success
- ✅ Sets error message on failure
- ✅ Sets `isLoading` to false after completion

#### register() Action
- ✅ Similar flow as login
- ✅ Calls `authApi.register()` instead

#### logout() Action
- ✅ Clears user
- ✅ Clears error
- ✅ Calls `authApi.logout()`

#### Computed Properties
- ✅ `isAuthenticated` - Returns true only if user + token exist
- ✅ `userInitials` - Calculates initials from user
- ✅ `displayName` - Builds display name

#### Other Actions
- ✅ `fetchProfile()` - Restores user from API
- ✅ `initializeAuth()` - Runs on app start

### Example Test
```typescript
it('should set user after successful login', async () => {
  // Arrange
  const store = useAuthStore()
  authApi.login.mockResolvedValue({ access_token: 'token' })
  authApi.getCurrentUser.mockResolvedValue(mockUser)

  // Act
  await store.login(credentials)

  // Assert
  expect(store.user).toEqual(mockUser)
})
```

### Key Concept
Tests **Pinia store** - the central state management. Uses `setActivePinia()` to create isolated store instances per test.

---

## 4️⃣ **Integration Tests: Auth Flows**
**File**: `tests/integration/auth.spec.ts`

### What It Tests

#### Complete Login Flow
```
User Form
    ↓
store.login(credentials)
    ↓
→ Calls authApi.login(credentials)
→ Sets isLoading = true
→ Calls authApi.getCurrentUser()
→ Sets store.user
→ Sets isLoading = false
    ↓
✅ User is authenticated
```

#### Complete Registration Flow
```
User Form
    ↓
store.register(data)
    ↓
→ Calls authApi.register(data)
→ Token stored
→ User profile fetched
→ Store updated
    ↓
✅ User is authenticated
```

#### Error Handling Scenarios
- ✅ Invalid credentials
- ✅ Network timeout
- ✅ Token expiry during profile fetch
- ✅ Email already exists (registration)
- ✅ Password too short (registration)

#### Session Management
- ✅ Logout clears all user data
- ✅ Session restoration from stored token
- ✅ Handling expired tokens on startup

#### Edge Cases
- ✅ Clearing previous errors on retry
- ✅ Loading state during concurrent operations

### Example Test
```typescript
it('should complete full login workflow', async () => {
  // Arrange
  authApi.login.mockResolvedValue(mockTokenResponse)
  authApi.getCurrentUser.mockResolvedValue(mockUser)

  // Act
  await store.login(credentials)

  // Assert
  expect(authApi.login).toHaveBeenCalledWith(credentials)
  expect(authApi.getCurrentUser).toHaveBeenCalled()
  expect(store.user).toEqual(mockUser)
  expect(store.isAuthenticated).toBe(true)
  expect(store.error).toBeNull()
})
```

### Key Concept
Tests **realistic user scenarios** - mimics actual workflows, not just individual functions.

---

## 🎯 How to Run Tests

### Run all tests
```bash
npm run test:unit
```

### Run auth tests only
```bash
npm run test:unit tests/unit/services/authApi.spec.ts
npm run test:unit tests/unit/store/auth.spec.ts
npm run test:integration/auth.spec.ts
```

### Watch mode (re-run on file changes)
```bash
npm run test:unit:watch
```

### Coverage report
```bash
npm run test:unit:coverage
```

---

## 📚 Test Structure Pattern (AAA)

All tests follow the **Arrange → Act → Assert** pattern:

```typescript
describe('Feature', () => {
  it('should do something', async () => {
    // 1. ARRANGE - Set up data and mocks
    const store = useAuthStore()
    authApi.login.mockResolvedValue(mockToken)

    // 2. ACT - Execute the code being tested
    await store.login(credentials)

    // 3. ASSERT - Verify the results
    expect(store.user).toBeDefined()
    expect(store.isAuthenticated).toBe(true)
  })
})
```

---

## 🔍 What Makes a Good Test

✅ **Good Tests**
- Test one thing only
- Have clear names describing what they test
- Use meaningful assertions
- Mock external dependencies
- Are independent (no order dependency)
- Run fast

❌ **Bad Tests**
- Test multiple things
- Vague names ("should work")
- No assertions (just checking no errors)
- No mocks (test real API calls)
- Depend on other tests

---

## 🚀 Next Steps to Improve Coverage

### Add Component Tests
```bash
# Test Vue components (LoginModal, RegisterModal)
tests/unit/components/auth/LoginModal.spec.ts
tests/unit/components/auth/RegisterModal.spec.ts
```

### Add Hook Tests
```bash
# Test useAuth, useApi composables
tests/unit/hooks/useAuth.spec.ts
tests/unit/hooks/useApi.spec.ts
```

### Add E2E Tests
```bash
# Test real browser interactions
tests/e2e/auth.cy.ts
```

---

## 📋 Coverage Checklist

- [x] TokenService utility functions
- [x] API service methods (login, register, getCurrentUser)
- [x] Store state management (user, loading, error)
- [x] Store actions (login, register, logout, fetchProfile)
- [x] Store computed properties (isAuthenticated, userInitials)
- [x] Error handling (invalid credentials, network errors)
- [x] Session restoration
- [ ] Vue component (LoginModal, RegisterModal)
- [ ] useAuth composable
- [ ] useApi hook
- [ ] Router auth guards
- [ ] E2E tests (full browser flow)

---

## 💡 Key Takeaways

1. **Unit Tests (47)** - Test individual functions in isolation
2. **Integration Tests (12)** - Test realistic user workflows
3. **Mocking** - API calls and TokenService are mocked to avoid real requests
4. **State Isolation** - Each test gets a fresh Pinia store instance
5. **Comprehensive** - Error cases, edge cases, and success cases all covered

---

## 🎓 Learning Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Best Practices](https://testing-library.com/docs/)
