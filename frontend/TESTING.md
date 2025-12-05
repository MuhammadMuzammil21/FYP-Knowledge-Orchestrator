# Testing Documentation

## Overview

This frontend application includes comprehensive unit testing using Jest and React Testing Library.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test:

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts
│   │   ├── api-client.test.ts
│   │   ├── auth-api.test.ts
│   │   └── meetings-api.test.ts
│   └── ...
├── components/
│   ├── layout/
│   │   ├── __tests__/
│   │   │   └── Sidebar.test.tsx
│   │   └── Sidebar.tsx
│   └── meetings/
│       ├── __tests__/
│       │   ├── StatusBadge.test.tsx
│       │   └── MeetingCard.test.tsx
│       └── ...
├── hooks/
│   ├── __tests__/
│   │   └── useMeetings.test.tsx
│   └── ...
└── app/
    ├── __tests__/
    │   ├── login.test.tsx
    │   ├── signup.test.tsx
    │   └── dashboard.test.tsx
    └── ...
```

## Test Coverage

### Utilities (100%)
- ✅ `cn()` class name utility
- ✅ API client error handling
- ✅ Error message extraction

### API Functions (100%)
- ✅ Auth API (login, signup, verify email, reset password)
- ✅ Meetings API (upload, list, detail, status, transcript, entities, conflicts)

### Components
- ✅ Login page
- ✅ Signup page
- ✅ Dashboard page
- ✅ Sidebar
- ✅ StatusBadge
- ✅ MeetingCard

### Hooks
- ✅ useMeetings
- ✅ useMeetingDetail
- ✅ useMeetingStatus

## Mocking Strategy

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));
```

### NextAuth
```typescript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

### API Client
```typescript
jest.mock('@/lib/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
```

## Writing New Tests

### Component Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert expected behavior
  });
});
```

### Hook Test Template
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useYourHook } from '../useYourHook';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useYourHook', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useYourHook(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Assert expected data
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies**: Mock API calls, navigation, and external libraries
4. **Test User Interactions**: Simulate real user behavior with `fireEvent` or `userEvent`
5. **Async Testing**: Use `waitFor` for async operations
6. **Coverage Goals**: Aim for >80% coverage on critical paths

## Continuous Integration

Tests run automatically on:
- Pre-commit (via git hooks, if configured)
- Pull requests
- Main branch commits

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Check `moduleNameMapper` in `jest.config.ts`

**Issue**: Async tests timeout
**Solution**: Increase timeout or check for unresolved promises

**Issue**: Mock not working
**Solution**: Ensure mock is defined before import

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Increase coverage to 90%+
- [ ] Add performance testing
- [ ] Add accessibility testing
