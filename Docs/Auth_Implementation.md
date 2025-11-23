# Authentication Setup Guide

## ✅ Installation Checklist

### Backend

- [ ] Create `backend/auth.py`
- [ ] Update `backend/main.py` to include auth router
- [ ] Test backend endpoints

### Frontend

- [ ] Install dependencies: `npm install next-auth@beta bcryptjs @types/bcryptjs`
- [ ] Install Shadcn components: `label`, `dropdown-menu`, `avatar`
- [ ] Create `src/auth.ts`
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create `src/app/auth/signin/page.tsx`
- [ ] Create `src/app/auth/signup/page.tsx`
- [ ] Create `src/middleware.ts`
- [ ] Create `src/components/layout/UserMenu.tsx`
- [ ] Update `src/app/providers.tsx`
- [ ] Update `src/app/page.tsx`
- [ ] Update `.env.local`

## 🚀 Testing Steps

### 1. Start Backend

```bash
cd backend
python main.py
```

Backend should be at: http://localhost:8000

### 2. Test Auth Endpoints

```bash
# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should be at: http://localhost:3000

### 4. Test Authentication Flow

1. **Visit** http://localhost:3000
   - Should redirect to `/auth/signin`

2. **Click "Sign Up"**
   - Fill in name, email, password
   - Submit form
   - Should auto-login and redirect to home

3. **Sign Out**
   - Click user avatar (top right)
   - Click "Sign Out"
   - Should redirect to sign in page

4. **Sign In Again**
   - Enter credentials
   - Should redirect to home page

5. **Try Protected Routes**
   - Access `/meetings/some-id` while signed out
   - Should redirect to sign in
   - Sign in, should redirect back

## 🎯 Features Implemented

### Authentication
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Sign Out
- ✅ JWT Session Management
- ✅ Protected Routes
- ✅ Auto-redirect after login

### UI Components
- ✅ Sign In Page
- ✅ Sign Up Page
- ✅ User Menu with Avatar
- ✅ Dropdown Profile Menu
- ✅ Loading States
- ✅ Error Handling
- ✅ Toast Notifications

### Security
- ✅ Password Hashing
- ✅ CSRF Protection (NextAuth)
- ✅ Secure Cookies
- ✅ Protected API Routes
- ✅ Middleware Authorization

## 📝 API Endpoints

### Backend (FastAPI)

```
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

GET /api/auth/user/{email}
```

### Frontend (NextAuth)

```
GET  /api/auth/signin
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
GET  /api/auth/csrf
```

## 🔧 Configuration

### Environment Variables

**Backend** (optional):
```env
# Add to backend/.env if needed
SECRET_KEY=your-secret-key
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

## 🎨 Customization

### Change Password Requirements

Edit `frontend/src/app/auth/signup/page.tsx`:
```typescript
if (formData.password.length < 8) { // Change minimum length
  toast.error('Password must be at least 8 characters');
  return;
}
```

### Add Password Validation

```typescript
// Add regex validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
if (!passwordRegex.test(formData.password)) {
  toast.error('Password must contain uppercase, lowercase, and number');
  return;
}
```

### Customize User Menu

Edit `frontend/src/components/layout/UserMenu.tsx` to add more menu items.

### Change Session Duration

Edit `frontend/src/auth.ts`:
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

## 🐛 Troubleshooting

### "Invalid credentials" on Sign In
- Check backend is running
- Verify email/password are correct
- Check backend logs for errors

### Redirect loop
- Clear cookies
- Check `NEXTAUTH_URL` in `.env.local`
- Restart dev server

### "Cannot find module 'next-auth'"
```bash
npm install next-auth@beta
```

### Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Check console for errors


## ✅ Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out works
- [ ] Protected routes redirect to login
- [ ] After login, redirects to intended page
- [ ] User menu shows correct name/email
- [ ] Password validation works
- [ ] Error messages display correctly
- [ ] Toast notifications appear
- [ ] Session persists on refresh

All done! 🎉