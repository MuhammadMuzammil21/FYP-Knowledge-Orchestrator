# Authentication Integration Complete

## Changes Made

### 1. Database Models
- Added `User` model with email, password, and verification status
- Added `VerificationToken` model for email verification
- Added `PasswordResetToken` model for password reset flow
- Added `user_id` foreign key to `Meeting` model

### 2. Authentication System
- JWT-based authentication with Bearer tokens
- Password hashing using bcrypt
- Email verification flow (abstract - tokens returned in dev mode)
- Password reset flow
- User profile management

### 3. Secured Endpoints
All meeting endpoints now require authentication:
- `POST /api/meetings/upload` - Requires verified email
- `GET /api/meetings` - Shows only user's meetings
- `GET /api/meetings/{id}` - Ownership verification
- `GET /api/meetings/{id}/status` - Ownership verification
- `GET /api/meetings/{id}/transcript` - Ownership verification
- `GET /api/meetings/{id}/transcript/stream` - Ownership verification
- `GET /api/meetings/{id}/entities` - Ownership verification
- `GET /api/meetings/{id}/conflicts` - Ownership verification
- `GET /api/meetings/{id}/search` - Ownership verification
- `GET /api/meetings/{id}/rag/query` - Ownership verification

### 4. Auth Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `PUT /api/auth/profile` - Update user profile

## Email Verification (Abstract)

Currently, verification tokens are returned in the API response for development.
To verify an account manually:

1. Sign up a user
2. Get the `verification_token` from the response
3. Call `POST /api/auth/verify-email` with the token

OR directly in the database:
```sql
UPDATE users SET email_verified = true WHERE email = 'user@example.com';
```

## Testing

### 1. Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

### 2. Verify Email (Manual)
```sql
UPDATE users SET email_verified = true WHERE email = 'test@example.com';
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 4. Use Token
```bash
curl -X GET http://localhost:8000/api/meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Frontend Integration

The frontend should:
1. Store JWT token after login/signup
2. Include `Authorization: Bearer {token}` header in all API requests
3. Handle 401 (unauthorized) and 403 (forbidden) responses
4. Redirect to login if token expires

## Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Verification tokens expire after 7 days
- Password reset tokens expire after 1 hour
- Meeting access is restricted to the owner only
